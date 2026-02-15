import csv
import json
from pathlib import Path

csv_file = 'examples/data.csv'
json_file = 'examples/data.json'

data = []
with open(csv_file, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    
    for row in reader:
        # Skip completely empty rows
        if not any(v for v in row.values() if v and v.strip()):
            continue
        
        cleaned_row = {}
        for key, value in row.items():
            # Skip empty field names
            if not key or not key.strip():
                continue
                
            clean_key = key.strip()
            clean_value = value.strip() if value else ''
            
            if clean_value == '':
                cleaned_row[clean_key] = None
            else:
                # Try to parse as number
                try:
                    # Handle comma as decimal separator
                    if ',' in clean_value:
                        num_value = float(clean_value.replace(',', '.'))
                        cleaned_row[clean_key] = num_value
                    else:
                        # Try integer
                        int_value = int(clean_value)
                        cleaned_row[clean_key] = int_value
                except (ValueError, AttributeError):
                    cleaned_row[clean_key] = clean_value
        
        data.append(cleaned_row)

# Write JSON
with open(json_file, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"✓ CSV convertit a JSON")
print(f"  Arxiu: {json_file}")
print(f"  Registres: {len(data)}")
