from pymongo import MongoClient
import json
from bson import json_util

# Connect to MongoDB
client = MongoClient("mongodb+srv://Geotechcompany:Locamade12182@cluster0.r8itkxl.mongodb.net/BQITECH?retryWrites=true&w=majority")
db = client.BQITECH

# Query for disqualified applications
status_variations = ["disqualified", "Disqualified", "DISQUALIFIED", "Disqualify", "DISQUALIFY"]
applications = list(db.applications.find({"status": {"$in": status_variations}}))

# Print results
print("\nFound applications:", len(applications))
print("\nStatus breakdown:")
status_counts = {}
for app in applications:
    status = app.get("status", "Unknown")
    status_counts[status] = status_counts.get(status, 0) + 1

for status, count in status_counts.items():
    print(f"{status}: {count}")

print("\nAll application statuses in database:")
all_statuses = db.applications.distinct("status")
print(json.dumps(all_statuses, default=json_util.default, indent=2)) 