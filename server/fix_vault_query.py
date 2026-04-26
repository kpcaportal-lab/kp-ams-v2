import os

file_path = r'd:\KP-AMS\kp-ams-v2\server\src\routes\dashboard.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

old_code = "a.scope_areas || ' (' || a.fiscal_year || ')' as title"
new_code = "COALESCE(a.scope_areas, a.scope_item, 'Working Paper') || ' (' || COALESCE(a.fiscal_year, 'N/A') || ')' as title"

if old_code in content:
    new_content = content.replace(old_code, new_code)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Replacement successful")
else:
    print("Old code not found")
    # Try searching for a substring
    if "a.scope_areas ||" in content:
        print("Found partial match")
    else:
        print("Even partial match not found")
