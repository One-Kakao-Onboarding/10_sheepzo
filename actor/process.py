
import json
import os
import time
from typing import List, Dict, Set
from main import extract_actor_info

# Configuration
OUTPUT_FILE = "final_actors.json"
RETRY_MODEL = "gemini-3-flash-preview"

def load_processed_actors() -> List[Dict]:
    """Load processed actors from output file."""
    if not os.path.exists(OUTPUT_FILE):
        print(f"⚠️ {OUTPUT_FILE} not found. Nothing to retry.")
        return []
    
    try:
        with open(OUTPUT_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except json.JSONDecodeError:
        print(f"❌ Error: {OUTPUT_FILE} is corrupted.")
        return []

def save_data(data: List[Dict]):
    """Save data to output file."""
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def retry_failed_actors(final_data: List[Dict]):
    """Retry actors with status='failed'."""
    failed_indices = [i for i, actor in enumerate(final_data) if actor.get("status") == "failed"]
    
    print(f"\n📊 Checking 'Failed' items...")
    print(f"⚠️ Failed Items to Retry: {len(failed_indices)}")
    
    if not failed_indices:
        print("✅ No 'failed' items found.")
        return
        
    retry_success_count = 0
    retry_fail_count = 0
    
    for count, idx in enumerate(failed_indices, 1):
        actor = final_data[idx]
        name = actor.get("name")
        link = actor.get("link")
        agency = actor.get("agency", "unknown")
        
        print(f"\n▶️ Retrying Failed {count}/{len(failed_indices)}: {name} (Agency: {agency})...")
        
        try:
            # Retry Extraction
            result = extract_actor_info(link, model=RETRY_MODEL)
            
            if "error" in result and "raw_response" in result:
                 print(f"❌ Retry Failed for {name}: {result['error']}")
                 final_data[idx]["error_message"] = result['error']
                 final_data[idx]["raw_response"] = result.get("raw_response")
                 retry_fail_count += 1
            else:
                print(f"✅ Retry Success: {name}")
                new_entry = result
                new_entry["link"] = link
                new_entry["agency"] = agency
                new_entry["status"] = "success"
                
                final_data[idx] = new_entry
                save_data(final_data)
                retry_success_count += 1
            
        except Exception as e:
            print(f"❌ Exception for {name}: {e}")
            final_data[idx]["error_message"] = str(e)
            retry_fail_count += 1

    print(f"✨ Failed Retry Summary: Recovered {retry_success_count}, Still Failed {retry_fail_count}")

def retry_missing_info_actors(final_data: List[Dict]):
    """Retry actors who have '정보 없음' as their name."""
    missing_indices = [i for i, actor in enumerate(final_data) if actor.get("name") == "정보 없음"]
    
    print(f"\n📊 Checking 'Missing Info' items...")
    print(f"⚠️ '정보 없음' Items to Retry: {len(missing_indices)}")
    
    if not missing_indices:
        print("✅ No 'Missing Info' items found.")
        return

    success_count = 0
    fail_count = 0
    
    for count, idx in enumerate(missing_indices, 1):
        actor = final_data[idx]
        link = actor.get("link")
        agency = actor.get("agency", "unknown")
        
        print(f"\n▶️ Retrying Missing Info {count}/{len(missing_indices)}: {link} (Agency: {agency})...")
        
        try:
            result = extract_actor_info(link, model=RETRY_MODEL)
            
            if "error" in result and "raw_response" in result:
                 print(f"❌ Retry Failed: {result['error']}")
                 final_data[idx]["error_message"] = result['error']
                 final_data[idx]["raw_response"] = result.get("raw_response")
                 # We might want to set status to failed if it wasn't already?
                 # But extracting '정보 없음' usually implies status was success but content was bad?
                 # Let's just keep status as is or update it if it fails now.
                 fail_count += 1
            else:
                new_name = result.get("name", "Unknown")
                if new_name == "정보 없음":
                    print(f"⚠️ Still '정보 없음'...")
                    fail_count += 1
                else:
                    print(f"✅ Retry Success! Name found: {new_name}")
                    
                    new_entry = result
                    new_entry["link"] = link
                    new_entry["agency"] = agency
                    new_entry["status"] = "success"
                    
                    final_data[idx] = new_entry
                    save_data(final_data)
                    success_count += 1
                
        except Exception as e:
            print(f"❌ Exception: {e}")
            final_data[idx]["error_message"] = str(e)
            fail_count += 1

    print(f"✨ Missing Info Retry Summary: Recovered {success_count}, Still Missing {fail_count}")

def main():
    print(f"🚀 Starting Retry Logic...")
    print(f"🤖 Model: {RETRY_MODEL}")
    
    # Load existing data
    final_data = load_processed_actors()
    if not final_data:
        return

    print(f"📊 Total Loaded: {len(final_data)}")

    # 1. Retry Failed Status
    retry_failed_actors(final_data)

    # 2. Retry '정보 없음' Names
    retry_missing_info_actors(final_data)

    print("\n" + "="*50)
    print(f"🎉 All Retry Processes Completed!")
    print(f"Final data saved to: {OUTPUT_FILE}")
    print("="*50)

if __name__ == "__main__":
    main()
