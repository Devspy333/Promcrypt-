# PromCrypt Terminal

PromCrypt Terminal is a retro-styled web application that allows users to download the latest Prometheus release, upload `.txt` or `.lua` files, and apply various encryption and minification presets.

## Features

- **Retro Terminal UI**: Classic green-on-black terminal aesthetic with a scrollable log pane and blinking cursor.
- **Download Prometheus**: Fetches the latest Prometheus release (`linux-amd64`) directly from GitHub.
- **Client-Side Processing**: All minification and encryption happens entirely in the browser. No data is sent to a server.
- **Lua Minification**: Custom algorithm to rename local variables, strip whitespace, and safely add semicolons.
- **Encryption Presets**:
  - **Minify**: Base64 encoding for `.txt`, Minification for `.lua`.
  - **Weak**: XOR encryption (0xAA key) for `.txt`, Minification for `.lua`.
  - **Medium**: AES-128-GCM encryption for `.txt`, Minification + AES-128-GCM for `.lua`.
  - **Strong**: AES-256-GCM encryption for `.txt`, Minification + AES-256-GCM for `.lua`.
- **Drag and Drop**: Easily drop files into the terminal to load them.
- **Copy & Download**: Copy the processed result to your clipboard or download it as a file.

## How to Use

1. **Download Prometheus**: Click the "Download Prometheus" button to fetch the latest release tarball.
2. **Upload a File**: Click "Upload File" or drag and drop a `.txt` or `.lua` file into the terminal window.
3. **Select a Preset**: Choose between Minify, Weak, Medium, or Strong.
4. **Run**: Click the "Run" button to process the file. The result will be displayed in the terminal log.
5. **Download/Copy**: Click "Download Result" to save the processed file, or "Copy Result" to copy it to your clipboard.
6. **Reset**: Click "Reset" to clear the terminal and start over.

## License

MIT License
