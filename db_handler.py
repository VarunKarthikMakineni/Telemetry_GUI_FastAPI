import sqlite3
import pydantic

class DBHandler:

    def __init__(self, filename, server_config):

        self.server_config = server_config
        self.filename = filename

        self.conn = sqlite3.connect(filename)
        self.conn.row_factory = sqlite3.Row
        self.cursor = self.conn.cursor()

        self.setup_db()

    # Ensure WAL mode is enabled and setup the table
    def setup_db(self):

        self.cursor.execute("PRAGMA journal_mode = WAL;")

        table_name = self.server_config["DB_TABLE_SCHEMA"]["table_name"]
        columns = self.server_config["DB_TABLE_SCHEMA"]["columns"]
        strict_mode = "STRICT" if self.server_config["DB_TABLE_SCHEMA"].get("strict", False) else ""

        # Generate CREATE TABLE query dynamically
        columns_sql = ",\n    ".join([f"{col} {col_props['type']}" for col, col_props in columns.items()])
        create_table_query = f"CREATE TABLE IF NOT EXISTS {table_name} (\n    {columns_sql}\n) {strict_mode};"

        self.cursor.execute(create_table_query)
        self.conn.commit()
        
    def write_row(self, validated_data):

        columns = ", ".join(validated_data.keys())  # e.g., "type, time, state, temperature, alt"
        placeholders = ", ".join(["?" for _ in validated_data])  # e.g., "?, ?, ?, ?, ?"
        values = tuple(validated_data.values())  # Convert dict values to tuple
        sql = f"INSERT INTO {self.server_config['DB_TABLE_SCHEMA']['table_name']} ({columns}) VALUES ({placeholders})"

        self.cursor.execute(sql, values)
        self.conn.commit()

    def close_db(self):

        self.conn.close()

    def get_row_count(self):

        self.cursor.execute(f"SELECT COUNT(*) FROM {self.server_config['DB_TABLE_SCHEMA']['table_name']}")
        return self.cursor.fetchone()[0]

    def get_row(self, row_num):

        self.cursor.execute(f"SELECT * FROM {self.server_config['DB_TABLE_SCHEMA']['table_name']} WHERE id = ?", (row_num,))
        return dict(self.cursor.fetchone())

# Pydantic model to validate the data received from the groundstation

def create_pydantic_model(config):
    """Creates a Pydantic model from column definitions, ignoring auto-increment IDs"""
    field_definitions = {}
    
    for name, col in config.items():
        if col.get("autoincrement"):
            continue
            
        # Determine Python type from SQL type
        if "INT" in col["type"]:
            py_type = int
        elif "REAL" in col["type"]:
            py_type = float
        else:
            py_type = str
        
        # Create Field with constraints
        field_kwargs = {}
        if "ge" in col:
            field_kwargs["ge"] = col["ge"]
        if "le" in col:
            field_kwargs["le"] = col["le"]
        if "min_length" in col:
            field_kwargs["min_length"] = col["min_length"]
        if "max_length" in col:
            field_kwargs["max_length"] = col["max_length"]
        
        # Add to model definition
        field_definitions[name] = (py_type, pydantic.Field(**field_kwargs))
    
    # Create the model class
    return pydantic.create_model(
        'DynamicModel',
        **field_definitions,
        __config__={'extra': 'allow'}
    )


# import json
# import csv

# with open("server_config.json", "r") as f:
#     server_config = json.load(f)

# db_handle = DBHandler("./logs/telemetry/telemetry.sqlite", server_config)  # Create a global instance of DBHandler

# print(db_handle.get_num_rows())  # Print the number of rows in the database

# # Read the CSV file and write each row to the database
# with open("sample_stream_data.csv", "r") as f:
#     # data has to be passed as a dictionary with keys as the column names
#     reader = csv.DictReader(f)
#     for row in reader:
#         db_handle.write_row(row)
    
# db_handle.close_db()  # Close the database connection