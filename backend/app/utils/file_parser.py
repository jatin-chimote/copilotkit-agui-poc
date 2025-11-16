import pandas as pd
import json
from typing import Dict, Any, List
from fastapi import UploadFile, HTTPException
import io


class SchemaExtractor:
    """Extract schema information from uploaded files (CSV, Excel, JSON)"""

    @staticmethod
    def _infer_type(dtype) -> str:
        """Infer JSON-friendly type from pandas dtype"""
        dtype_str = str(dtype)

        if 'int' in dtype_str:
            return 'integer'
        elif 'float' in dtype_str:
            return 'number'
        elif 'bool' in dtype_str:
            return 'boolean'
        elif 'datetime' in dtype_str or 'timedelta' in dtype_str:
            return 'datetime'
        else:
            return 'string'

    @staticmethod
    async def extract_schema_from_file(file: UploadFile) -> Dict[str, Any]:
        """
        Extract schema from uploaded file (CSV, Excel, or JSON)

        Returns:
            {
                "columns": [
                    {"name": "column1", "type": "string", "example": "value"},
                    {"name": "column2", "type": "integer", "example": 123}
                ]
            }
        """
        try:
            # Read file content
            content = await file.read()
            filename = file.filename.lower()

            # Parse based on file extension
            if filename.endswith('.csv'):
                df = pd.read_csv(io.BytesIO(content))
            elif filename.endswith(('.xlsx', '.xls')):
                df = pd.read_excel(io.BytesIO(content))
            elif filename.endswith('.json'):
                # Try to read as JSON
                json_data = json.loads(content)

                # If it's a list of objects, use first object as schema
                if isinstance(json_data, list) and len(json_data) > 0:
                    df = pd.DataFrame(json_data)
                elif isinstance(json_data, dict):
                    # If it's a single object or already a schema
                    if 'columns' in json_data:
                        # Already a schema format
                        return json_data
                    else:
                        df = pd.DataFrame([json_data])
                else:
                    raise ValueError("JSON must be an object or array of objects")
            else:
                raise HTTPException(
                    status_code=400,
                    detail=f"Unsupported file type. Please upload CSV, Excel (.xlsx, .xls), or JSON files."
                )

            # Extract schema
            columns = []
            for col_name in df.columns:
                col_type = SchemaExtractor._infer_type(df[col_name].dtype)

                # Get a sample value (first non-null value)
                example = None
                for val in df[col_name]:
                    if pd.notna(val):
                        example = val
                        # Convert to JSON-serializable type
                        if isinstance(example, (pd.Timestamp, pd.Timedelta)):
                            example = str(example)
                        elif isinstance(example, (int, float, bool, str)):
                            example = example
                        else:
                            example = str(example)
                        break

                columns.append({
                    "name": col_name,
                    "type": col_type,
                    "example": example
                })

            return {
                "columns": columns,
                "row_count": len(df)
            }

        except json.JSONDecodeError as e:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid JSON file: {str(e)}"
            )
        except pd.errors.ParserError as e:
            raise HTTPException(
                status_code=400,
                detail=f"Error parsing file: {str(e)}"
            )
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Error processing file: {str(e)}"
            )
