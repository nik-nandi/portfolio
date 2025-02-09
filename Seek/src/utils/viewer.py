import os
import webbrowser
import time
from pathlib import Path
import tkinter as tk
from tkinter import ttk, messagebox

def find_scraped_sites(base_dir='scraped_sites'):
    sites = []
    if not os.path.exists(base_dir):
        return sites
    for entry in os.listdir(base_dir):
        path = Path(base_dir) / entry
        if path.is_dir() and (path / 'index.html').exists():
            sites.append(path)
    return sorted(sites, key=lambda x: x.stat().st_mtime, reverse=True)

class ScrapedSitesGUI(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Scraped Sites Viewer")
        
        # Set window size and position it in center of screen
        window_width = 800
        window_height = 600
        screen_width = self.winfo_screenwidth()
        screen_height = self.winfo_screenheight()
        center_x = int(screen_width/2 - window_width/2)
        center_y = int(screen_height/2 - window_height/2)
        
        self.geometry(f'{window_width}x{window_height}+{center_x}+{center_y}')
        self.resizable(False, False)  # Disable both horizontal and vertical resizing
        self.minsize(800, 600)  # Set minimum size
        self.maxsize(800, 600)  # Set maximum size
        
        # Add window icon (optional)
        try:
            self.iconbitmap('folder.ico')  # You would need to provide this icon file
        except:
            pass
            
        self.create_widgets()
        self.load_sites()

    def create_widgets(self):
        # Create a frame for the listbox and scrollbar
        frame = ttk.Frame(self)
        frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)

        # Create scrollbar
        scrollbar = ttk.Scrollbar(frame, orient=tk.VERTICAL)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)

        # Create listbox
        self.sites_listbox = tk.Listbox(frame, yscrollcommand=scrollbar.set, font=("Segoe UI", 10))
        self.sites_listbox.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        self.sites_listbox.bind("<Double-Button-1>", self.on_double_click)

        scrollbar.config(command=self.sites_listbox.yview)

        # Create refresh and quit buttons
        btn_frame = ttk.Frame(self)
        btn_frame.pack(fill=tk.X, padx=10, pady=5)

        refresh_btn = ttk.Button(btn_frame, text="Refresh", command=self.load_sites)
        refresh_btn.pack(side=tk.LEFT, padx=(0, 5))
        open_btn = ttk.Button(btn_frame, text="Open Selected", command=self.open_selected)
        open_btn.pack(side=tk.LEFT, padx=(0, 5))
        quit_btn = ttk.Button(btn_frame, text="Quit", command=self.destroy)
        quit_btn.pack(side=tk.RIGHT)

    def load_sites(self):
        self.sites_listbox.delete(0, tk.END)
        self.sites = find_scraped_sites()
        if not self.sites:
            self.sites_listbox.insert(tk.END, "No scraped sites found")
        else:
            for site in self.sites:
                mod_time = time.ctime(site.stat().st_mtime)
                self.sites_listbox.insert(tk.END, f"{site.name} - {mod_time}")

    def on_double_click(self, event):
        self.open_selected()

    def open_selected(self):
        selection = self.sites_listbox.curselection()
        if not selection:
            messagebox.showinfo("Info", "No site selected!")
            return

        index = selection[0]
        if not self.sites:
            return
        site = self.sites[index]
        index_file = site / 'index.html'
        if index_file.exists():
            webbrowser.open(f'file://{index_file.resolve()}')
        else:
            messagebox.showerror("Error", "'index.html' not found in the selected site.")

if __name__ == "__main__":
    app = ScrapedSitesGUI()
    app.mainloop()