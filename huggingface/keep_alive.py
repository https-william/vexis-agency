import time
import requests
import threading

def ping_server():
    """
    Pings the locally exposed Hugging Face port 7860 every 25 minutes
    to ensure the instance does not spin down due to inactivity.
    """
    while True:
        try:
            res = requests.get("http://localhost:7860/")
            print(f"[Anti-Sleep] Pinged orchestrator gateway: {res.status_code}")
        except Exception as e:
            print(f"[Anti-Sleep] Gateway unreachable yet: {e}")
        time.sleep(1500) # Sleep for 25 minutes (1500 seconds)

if __name__ == "__main__":
    t = threading.Thread(target=ping_server)
    t.daemon = True
    t.start()
    
    # Keep main process alive indefinitely
    while True:
        time.sleep(1000000)
