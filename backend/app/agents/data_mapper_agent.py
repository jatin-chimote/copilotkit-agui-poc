import os
from typing import TypedDict, Annotated, Dict, Any
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode
import json

class MappingState(TypedDict):
    """State for the data mapping agent."""
    source_schema: Dict[str, Any]
    destination_schema: Dict[str, Any]
    user_message: str
    current_mapping: Dict[str, str]
    agent_response: str
    confidence_score: float
    conversation_history: list

class DataMapperAgent:
    """
    LangGraph agent for intelligent column mapping between source and destination schemas.
    """

    def __init__(self, openai_api_key: str = None):
        self.api_key = openai_api_key or os.getenv("OPENAI_API_KEY")
        self.llm = ChatOpenAI(
            model="gpt-4",
            temperature=0.1,
            api_key=self.api_key
        )
        self.graph = self._build_graph()

    def _build_graph(self):
        """Build the LangGraph workflow."""
        workflow = StateGraph(MappingState)

        # Add nodes
        workflow.add_node("analyze_schemas", self._analyze_schemas)
        workflow.add_node("generate_mapping", self._generate_mapping)
        workflow.add_node("validate_mapping", self._validate_mapping)

        # Define edges
        workflow.set_entry_point("analyze_schemas")
        workflow.add_edge("analyze_schemas", "generate_mapping")
        workflow.add_edge("generate_mapping", "validate_mapping")
        workflow.add_edge("validate_mapping", END)

        return workflow.compile()

    def _analyze_schemas(self, state: MappingState) -> MappingState:
        """Analyze source and destination schemas."""
        prompt = ChatPromptTemplate.from_messages([
            ("system", """You are a data mapping expert. Analyze the source and destination schemas
            and understand the structure, column names, data types, and relationships.

            Destination Schema: {destination_schema}
            Source Schema: {source_schema}

            User Message: {user_message}

            Provide insights about potential mappings."""),
        ])

        response = self.llm.invoke(
            prompt.format_messages(
                destination_schema=json.dumps(state["destination_schema"], indent=2),
                source_schema=json.dumps(state["source_schema"], indent=2),
                user_message=state["user_message"]
            )
        )

        state["agent_response"] = response.content
        return state

    def _generate_mapping(self, state: MappingState) -> MappingState:
        """Generate column mappings using AI."""
        prompt = ChatPromptTemplate.from_messages([
            ("system", """You are a data mapping expert. Generate intelligent column mappings
            from the source schema to the destination schema.

            Destination Schema (fixed target):
            {destination_schema}

            Source Schema (vendor data):
            {source_schema}

            User Message: {user_message}
            Previous Analysis: {analysis}

            Rules:
            1. Map each source column to the most appropriate destination column
            2. Consider semantic meaning, not just column names
            3. If no good match exists, suggest null or transformation needed
            4. Provide confidence score for each mapping (0-1)

            Return a JSON object with this structure:
            {{
                "mappings": {{
                    "destination_column_name": "source_column_name"
                }},
                "confidence": 0.95,
                "reasoning": "Explanation of the mappings",
                "warnings": ["List of potential issues or transformations needed"]
            }}

            Only return valid JSON, no additional text."""),
        ])

        response = self.llm.invoke(
            prompt.format_messages(
                destination_schema=json.dumps(state["destination_schema"], indent=2),
                source_schema=json.dumps(state["source_schema"], indent=2),
                user_message=state["user_message"],
                analysis=state.get("agent_response", "")
            )
        )

        try:
            # Parse the JSON response
            mapping_data = json.loads(response.content)
            state["current_mapping"] = mapping_data.get("mappings", {})
            state["confidence_score"] = mapping_data.get("confidence", 0.0)
            state["agent_response"] = mapping_data.get("reasoning", "")

            if mapping_data.get("warnings"):
                state["agent_response"] += "\n\nWarnings:\n" + "\n".join(
                    f"- {w}" for w in mapping_data["warnings"]
                )
        except json.JSONDecodeError:
            # Fallback if JSON parsing fails
            state["agent_response"] = response.content
            state["confidence_score"] = 0.5

        return state

    def _validate_mapping(self, state: MappingState) -> MappingState:
        """Validate the generated mappings."""
        dest_columns = set(state["destination_schema"].keys())
        mapped_columns = set(state["current_mapping"].keys())

        # Check for unmapped required columns
        unmapped = dest_columns - mapped_columns
        if unmapped:
            state["agent_response"] += f"\n\nNote: The following destination columns are unmapped: {', '.join(unmapped)}"
            state["confidence_score"] *= 0.9  # Reduce confidence

        return state

    def map_schemas(
        self,
        source_schema: Dict[str, Any],
        destination_schema: Dict[str, Any],
        user_message: str = "Please map these schemas intelligently",
        current_mapping: Dict[str, str] = None
    ) -> Dict[str, Any]:
        """
        Main method to map schemas using the agent.

        Args:
            source_schema: Source schema to map from
            destination_schema: Destination schema to map to
            user_message: User's instructions or context
            current_mapping: Existing partial mapping

        Returns:
            Dictionary with mapping, response, and confidence
        """
        initial_state = MappingState(
            source_schema=source_schema,
            destination_schema=destination_schema,
            user_message=user_message,
            current_mapping=current_mapping or {},
            agent_response="",
            confidence_score=0.0,
            conversation_history=[]
        )

        final_state = self.graph.invoke(initial_state)

        return {
            "mapping": final_state["current_mapping"],
            "response": final_state["agent_response"],
            "confidence": final_state["confidence_score"]
        }

    def refine_mapping(
        self,
        source_schema: Dict[str, Any],
        destination_schema: Dict[str, Any],
        current_mapping: Dict[str, str],
        user_feedback: str
    ) -> Dict[str, Any]:
        """
        Refine an existing mapping based on user feedback.
        """
        return self.map_schemas(
            source_schema,
            destination_schema,
            f"Current mapping needs refinement. User feedback: {user_feedback}",
            current_mapping
        )
