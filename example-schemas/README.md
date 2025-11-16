# Example Schema Files for Testing Data Mapper Agent

This directory contains realistic example schema files for testing the file upload and AI-powered schema mapping functionality.

## Directory Structure

```
example-schemas/
├── destination/     # Standardized destination schemas (target format)
│   ├── purchase_orders.csv
│   ├── customer_data.json
│   ├── product_catalog.csv
│   ├── invoice_data.json
│   └── employee_records.csv
└── vendors/         # Vendor source schemas (various formats to be mapped)
    ├── vendor_a_purchase_orders.csv
    ├── vendor_b_customer_data.json
    ├── vendor_c_product_catalog.csv
    ├── vendor_d_invoice_data.json
    └── vendor_e_employee_records.csv
```

## Destination Schemas (Standardized Formats)

These represent your company's standardized data format that all vendor data should be mapped to.

### 1. Purchase Orders (`purchase_orders.csv`)
**Use Case:** E-commerce and procurement systems
**Format:** CSV
**Columns:** 12 columns including order details, customer info, product info, pricing, and fulfillment status

**Key Fields:**
- `order_id`, `order_date`, `customer_id`, `customer_name`
- `product_id`, `product_name`, `quantity`, `unit_price`, `total_amount`
- `status`, `shipping_address`, `payment_method`

---

### 2. Customer Data (`customer_data.json`)
**Use Case:** CRM and customer management systems
**Format:** JSON
**Columns:** 16 fields covering customer demographics, business info, and account status

**Key Fields:**
- `customer_id`, `first_name`, `last_name`, `email`, `phone`
- `company`, `industry`, `country`, `state`, `city`
- `account_status`, `lifetime_value`, `credit_limit`

---

### 3. Product Catalog (`product_catalog.csv`)
**Use Case:** E-commerce platforms and inventory management
**Format:** CSV
**Columns:** 16 columns covering product details, pricing, inventory, and logistics

**Key Fields:**
- `product_id`, `product_name`, `category`, `subcategory`, `manufacturer`
- `sku`, `barcode`, `unit_price`, `cost_price`, `stock_quantity`
- `warehouse_location`, `weight_kg`, `dimensions_cm`, `is_active`

---

### 4. Invoice Data (`invoice_data.json`)
**Use Case:** Accounting and billing systems
**Format:** JSON
**Columns:** 19 fields covering invoice details, billing, payments, and accounting

**Key Fields:**
- `invoice_id`, `invoice_date`, `due_date`, `customer_id`
- `subtotal`, `tax_rate`, `tax_amount`, `shipping_cost`
- `discount_percent`, `total_amount`, `amount_paid`, `balance_due`
- `payment_status`, `payment_terms`, `currency`

---

### 5. Employee Records (`employee_records.csv`)
**Use Case:** HRIS and payroll systems
**Format:** CSV
**Columns:** 18 columns covering employee personal info, employment details, and performance

**Key Fields:**
- `employee_id`, `first_name`, `last_name`, `email`, `phone`
- `department`, `job_title`, `hire_date`, `employment_type`
- `salary`, `manager_id`, `office_location`, `work_schedule`
- `performance_rating`, `last_review_date`

---

## Vendor Source Schemas (To Be Mapped)

These represent data from different vendors with varying column names, structures, and fields. The AI agent will help map these to your standardized format.

### Vendor A - Purchase Orders
**File:** `vendor_a_purchase_orders.csv`
**Key Differences:**
- Different column names: `PO_Number` vs `order_id`, `ClientID` vs `customer_id`
- Additional fields: `OrderPriority`, `SalesRep`
- Combined address field: `DeliveryAddress` vs separate fields
- Different status values: `CONFIRMED` vs `confirmed`

**Mapping Challenges:**
- Column name variations (e.g., `OrderQty` → `quantity`)
- Abbreviated vs full names (e.g., `ItemCode` → `product_id`)
- Format differences in addresses

---

### Vendor B - Customer Data
**File:** `vendor_b_customer_data.json`
**Key Differences:**
- Different field names: `client_number` vs `customer_id`, `contact_first` vs `first_name`
- Combined address: `full_address` vs separate `address_line1`, `city`, `state`, etc.
- Missing fields: No separate `postal_code`, `address_line2`
- Extra fields: `marketing_opt_in`, `primary_contact`, `business_type`
- Different tier naming: `account_tier` (premium/standard/gold) vs `account_status` (active)

**Mapping Challenges:**
- Parsing combined address into separate fields
- Mapping account tier to status
- Handling missing data fields

---

### Vendor C - Product Catalog
**File:** `vendor_c_product_catalog.csv`
**Key Differences:**
- Different naming: `ItemID` vs `product_id`, `ItemName` vs `product_name`
- Different codes: `EAN` vs `barcode`, `StockKeepingUnit` vs `sku`
- Status format: `Y`/`N` vs `true`/`false` for `ActiveStatus`
- Additional fields: `Supplier`, `LeadTimeDays`
- Weight units match but different naming: `WeightInKG` vs `weight_kg`

**Mapping Challenges:**
- Converting Y/N to boolean
- Field name standardization
- Unit consistency verification

---

### Vendor D - Invoice Data
**File:** `vendor_d_invoice_data.json`
**Key Differences:**
- Different field names: `bill_number` vs `invoice_id`, `client_ref` vs `customer_id`
- Different terminology: `freight_charges` vs `shipping_cost`, `promo_discount` vs `discount`
- Status format: `PARTIAL_PAID` vs `partial`, `PAID_FULL` vs `paid`
- Terms format: `NET_30` vs `Net 30`
- Additional fields: `internal_notes`, `po_reference`
- Different address fields: `bill_to_address` vs `billing_address`

**Mapping Challenges:**
- Terminology alignment
- Status value normalization
- Handling underscore vs camelCase naming

---

### Vendor E - Employee Records
**File:** `vendor_e_employee_records.csv`
**Key Differences:**
- Different naming: `StaffID` vs `employee_id`, `GivenName`/`FamilyName` vs `first_name`/`last_name`
- Different fields: `Division` vs `department`, `Position` vs `job_title`
- Status format: `FULL_TIME` vs `full_time`, work modes uppercase
- Additional fields: `YearsOfService`, `CertificationLevel`, `Nation`
- Benefits naming: `BenefitsPlan` (PLATINUM/GOLD/SILVER/BRONZE) vs `benefits_tier`

**Mapping Challenges:**
- Name field variations
- Case conversion (FULL_TIME → full_time)
- Benefits tier mapping
- Handling extra informational fields

---

## How to Use These Examples

### 1. Testing Project Creation
1. Start the application (backend + frontend)
2. Click "New" to create a project
3. Upload a **destination schema** file (e.g., `purchase_orders.csv`)
4. The app will parse and display the schema
5. Name your project (e.g., "Purchase Orders Standardization")
6. Create the project

### 2. Testing Vendor Schema Upload
1. Select your created project
2. Click "Add Vendor"
3. Upload a **vendor source schema** file (e.g., `vendor_a_purchase_orders.csv`)
4. Enter vendor details
5. The app will parse and display the vendor schema
6. Create the vendor subproject

### 3. Testing AI Mapping
1. Select a vendor with uploaded schema
2. Use the chat interface to request mapping
3. Example prompts:
   - "Map all columns from this vendor schema to the destination"
   - "What's the confidence level for mapping OrderQty to quantity?"
   - "Show me which fields are unmapped"
   - "Map PO_Number to order_id and ClientID to customer_id"

### 4. Testing Different File Formats
- **CSV files:** Excel, Google Sheets, data exports
- **JSON files:** API responses, NoSQL exports, configuration files

---

## Mapping Scenarios Covered

### Easy Mappings (High Confidence)
- Direct name matches: `email` → `email`
- Obvious abbreviations: `qty` → `quantity`
- Simple case changes: `ProductID` → `product_id`

### Medium Complexity (Medium Confidence)
- Similar meaning different words: `ClientID` → `customer_id`
- Prefix/suffix variations: `OrderDate` → `order_date`
- Combined fields: `ClientCompanyName` → `customer_name`

### Complex Mappings (Lower Confidence)
- Parsing combined fields: `full_address` → `city`, `state`, `postal_code`
- Value transformations: `Y` → `true`, `CONFIRMED` → `confirmed`
- Terminology differences: `freight_charges` → `shipping_cost`
- Multi-to-one: Multiple vendor fields → single destination field

---

## Data Quality Features

All example files include:
- **Realistic data:** Company names, addresses, products based on real-world patterns
- **Consistent formatting:** Proper dates, currencies, phone numbers
- **Variety:** Different industries, locations, and business scenarios
- **Complete records:** No missing critical data in examples
- **Edge cases:** Different naming conventions, formats, and structures

---

## Adding Your Own Examples

To add custom example files:

1. **For destination schemas:** Add to `destination/` folder
   - Use clear, standardized column names
   - Include 3-7 sample rows
   - Use CSV for tabular data, JSON for hierarchical

2. **For vendor schemas:** Add to `vendors/` folder
   - Intentionally use different column names
   - Add/remove fields compared to destination
   - Use realistic naming from actual vendor systems

3. **Supported formats:**
   - CSV (`.csv`)
   - Excel (`.xlsx`, `.xls`)
   - JSON (`.json` - array of objects)

---

## Tips for Best Results

1. **Column Names:** Use descriptive names that hint at the data type and purpose
2. **Sample Data:** Include 3-10 rows with realistic values
3. **Data Types:** Mix strings, numbers, dates, booleans for type inference
4. **Consistency:** Keep formatting consistent within each file
5. **Documentation:** Add comments in JSON or headers in CSV

---

## Testing Checklist

- [ ] Upload CSV destination schema
- [ ] Upload JSON destination schema
- [ ] Upload CSV vendor schema with different column names
- [ ] Upload JSON vendor schema with missing fields
- [ ] Test AI mapping with simple column matches
- [ ] Test AI mapping with complex field parsing
- [ ] Test confidence scoring for different mapping types
- [ ] Test refinement of mappings through chat
- [ ] Verify schema preview before project creation
- [ ] Test with files containing 100+ rows

---

## Support

For issues or questions about the example schemas:
1. Check the main project README
2. Review the TROUBLESHOOTING.md guide
3. Report issues on GitHub

---

**Happy Testing!** 🚀
