import os
import time
import json
from datetime import datetime
from scholarly import scholarly, ProxyGenerator

max_attempts = 20
wait_seconds = 10

for attempt in range(1, max_attempts + 1):
    try:
        print(f"Attempt {attempt}:")
        pg = ProxyGenerator()
        pg.FreeProxies()
        scholarly.use_proxy(pg)

        author: dict = scholarly.search_author_id(os.environ["GOOGLE_SCHOLAR_ID"])
        scholarly.fill(author, sections=["basics", "indices", "counts", "publications"])
        print(f"Attempt {attempt} success")
        break
    except Exception as e:
        print(f"Attempt {attempt} failed with error: {e}")
        time.sleep(wait_seconds)
else:
    print(f"All {max_attempts} attempts failed.")
    raise Exception("Failed to fetch author data after multiple attempts.")

name = author["name"]
author["updated"] = str(datetime.now())
author["publications"] = {v["author_pub_id"]: v for v in author["publications"]}
print(json.dumps(author, indent=2))
os.makedirs("results", exist_ok=True)
with open(f"results/gs_data.json", "w") as outfile:
    json.dump(author, outfile, ensure_ascii=False)

shieldio_data = {
    "schemaVersion": 1,
    "label": "citations",
    "message": f"{author['citedby']}",
}
with open(f"results/gs_data_shieldsio.json", "w") as outfile:
    json.dump(shieldio_data, outfile, ensure_ascii=False)
