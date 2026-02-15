#!/usr/bin/env python3
import csv
import json

# Read CSV file
csv_file = 'examples/data.csv'
json_file = 'examples/data.json'

data = []
with open(csv_file, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        # Skip empty rows
        if not any(row.values()):
            continue
        
        # Remove trailing spaces from field names and values
        cleaned_row = {}
        for key, value in row.items():
            clean_key = key.strip() if key else key
            clean_value = value.strip() if value else value
            
            # Convert empty strings to null, and numeric strings to numbers where appropriate
            if clean_value == '':
                cleaned_row[clean_key] = None
            elif clean_value.lower() in ('null', 'none'):
                cleaned_row[clean_key] = None
            else:
                # Try to convert to number
                try:
                    if ',' in clean_value:
                        # Handle comma as decimal separator
                        num_value = float(clean_value.replace(',', '.'))
                        cleaned_row[clean_key] = num_value
                    else:
                        # Try integer first
                        int_value = int(clean_value)
                        cleaned_row[clean_key] = int_value
                except (ValueError, AttributeError):
                    cleaned_row[clean_key] = clean_value
        
        data.append(cleaned_row)

# Write JSON file
with open(json_file, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"✓ CSV convertit a JSON")
print(f"  Arxiu: {json_file}")
print(f"  Registres: {len(data)}")
