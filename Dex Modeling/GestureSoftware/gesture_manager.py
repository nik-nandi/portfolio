import json
import os
import sys
import re
from datetime import datetime
import tkinter as tk
from tkinter import ttk, messagebox

class GestureManager:
    def __init__(self, gestures_file="gestures.json"):
        self.gestures_file = gestures_file
        self.gestures = self.load_gestures()
        self.create_backup()
        
    def load_gestures(self):
        if os.path.exists(self.gestures_file):
            try:
                with open(self.gestures_file, 'r') as f:
                    return json.load(f)
            except json.JSONDecodeError:
                print(f"Error: {self.gestures_file} is not a valid JSON file")
                return {"static": {}, "dynamic": {}}
        return {"static": {}, "dynamic": {}}
    
    def save_gestures(self):
        with open(self.gestures_file, 'w') as f:
            json.dump(self.gestures, f, indent=4)
        print(f"Gestures saved to {self.gestures_file}")
    
    def create_backup(self):
        if os.path.exists(self.gestures_file):
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_file = f"{os.path.splitext(self.gestures_file)[0]}_backup_{timestamp}.json"
            try:
                with open(self.gestures_file, 'r') as src, open(backup_file, 'w') as dst:
                    dst.write(src.read())
                print(f"Backup created: {backup_file}")
            except Exception as e:
                print(f"Failed to create backup: {e}")
    
    def list_gestures(self):
        print("\nAvailable Gestures:")
        print("-" * 30)
        
        if not self.gestures["static"] and not self.gestures["dynamic"]:
            print("No gestures found.")
            return
        
        for gesture_type in ["static", "dynamic"]:
            if self.gestures[gesture_type]:
                print(f"\n{gesture_type.upper()} GESTURES:")
                for i, name in enumerate(self.gestures[gesture_type].keys(), 1):
                    print(f"{i}. {name}")
    
    def delete_gesture(self, gesture_type, gesture_name):
        if gesture_type not in ["static", "dynamic"]:
            print("Invalid gesture type. Must be 'static' or 'dynamic'.")
            return False
        
        if gesture_name not in self.gestures[gesture_type]:
            print(f"Gesture '{gesture_name}' not found in {gesture_type} gestures.")
            return False
        
        del self.gestures[gesture_type][gesture_name]
        self.save_gestures()
        print(f"Deleted {gesture_type} gesture: {gesture_name}")
        return True
    
    def run_cli(self):
        while True:
            print("\nGesture Manager")
            print("==============")
            print("1. List all gestures")
            print("2. Delete a gesture")
            print("3. Exit")
            
            choice = input("\nEnter your choice (1-3): ")
            
            if choice == "1":
                self.list_gestures()
            
            elif choice == "2":
                self.list_gestures()
                print("\nDelete a gesture:")
                gesture_type = input("Enter gesture type (static/dynamic): ").lower()
                
                if gesture_type not in ["static", "dynamic"]:
                    print("Invalid gesture type. Must be 'static' or 'dynamic'.")
                    continue
                
                if not self.gestures[gesture_type]:
                    print(f"No {gesture_type} gestures found.")
                    continue
                
                gesture_name = input(f"Enter {gesture_type} gesture name to delete: ")
                
                if gesture_name not in self.gestures[gesture_type]:
                    print(f"Gesture '{gesture_name}' not found.")
                    continue
                
                confirm = input(f"Are you sure you want to delete '{gesture_name}'? (y/n): ")
                if confirm.lower() == "y":
                    self.delete_gesture(gesture_type, gesture_name)
            
            elif choice == "3":
                print("Exiting Gesture Manager.")
                break
            
            else:
                print("Invalid choice. Please enter a number between 1 and 3.")


class GestureManagerGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("Gesture Manager")
        self.root.geometry("500x400")
        self.root.resizable(True, True)
        
        self.manager = GestureManager()
        
        self.setup_ui()
        
        self.refresh_gesture_list()
    
    def setup_ui(self):
        main_frame = ttk.Frame(self.root, padding="10")
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        type_frame = ttk.Frame(main_frame)
        type_frame.pack(fill=tk.X, pady=5)
        
        ttk.Label(type_frame, text="Gesture Type:").pack(side=tk.LEFT)
        
        self.gesture_type_var = tk.StringVar(value="static")
        ttk.Radiobutton(type_frame, text="Static", variable=self.gesture_type_var, 
                        value="static", command=self.refresh_gesture_list).pack(side=tk.LEFT, padx=10)
        ttk.Radiobutton(type_frame, text="Dynamic", variable=self.gesture_type_var, 
                        value="dynamic", command=self.refresh_gesture_list).pack(side=tk.LEFT)
        
        list_frame = ttk.Frame(main_frame)
        list_frame.pack(fill=tk.BOTH, expand=True, pady=5)
        
        ttk.Label(list_frame, text="Available Gestures:").pack(anchor=tk.W)
        
        scrollbar = ttk.Scrollbar(list_frame)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        self.gesture_listbox = tk.Listbox(list_frame, yscrollcommand=scrollbar.set, height=10, width=40)
        self.gesture_listbox.pack(fill=tk.BOTH, expand=True, padx=5)
        
        scrollbar.config(command=self.gesture_listbox.yview)
        
        button_frame = ttk.Frame(main_frame)
        button_frame.pack(fill=tk.X, pady=10)
        
        ttk.Button(button_frame, text="Delete Selected", command=self.delete_selected).pack(side=tk.LEFT, padx=5)
        ttk.Button(button_frame, text="Refresh", command=self.refresh_gesture_list).pack(side=tk.LEFT, padx=5)
        ttk.Button(button_frame, text="Exit", command=self.root.destroy).pack(side=tk.RIGHT, padx=5)
        
        self.status_var = tk.StringVar()
        status_bar = ttk.Label(main_frame, textvariable=self.status_var, relief=tk.SUNKEN, anchor=tk.W)
        status_bar.pack(fill=tk.X, side=tk.BOTTOM, pady=5)
        
        self.status_var.set("Ready")
    
    def refresh_gesture_list(self):
        self.gesture_listbox.delete(0, tk.END)
        
        gesture_type = self.gesture_type_var.get()
        gestures = self.manager.gestures[gesture_type]
        
        if not gestures:
            self.status_var.set(f"No {gesture_type} gestures found")
            return
        
        for name in gestures.keys():
            self.gesture_listbox.insert(tk.END, name)
        
        self.status_var.set(f"Loaded {len(gestures)} {gesture_type} gestures")
    
    def delete_selected(self):
        selected_indices = self.gesture_listbox.curselection()
        
        if not selected_indices:
            messagebox.showwarning("No Selection", "Please select a gesture to delete")
            return
        
        selected_idx = selected_indices[0]
        gesture_name = self.gesture_listbox.get(selected_idx)
        gesture_type = self.gesture_type_var.get()
        
        if messagebox.askyesno("Confirm Deletion", f"Are you sure you want to delete '{gesture_name}'?"):
            if self.manager.delete_gesture(gesture_type, gesture_name):
                self.refresh_gesture_list()
                self.status_var.set(f"Deleted {gesture_type} gesture: {gesture_name}")


def main():
    if len(sys.argv) > 1 and sys.argv[1] == "--cli":
        manager = GestureManager()
        manager.run_cli()
    else:
        root = tk.Tk()
        app = GestureManagerGUI(root)
        root.mainloop()


if __name__ == "__main__":
    main()