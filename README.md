# My Swaggu CLI
<img width="500" height="500" alt="unnamed-removebg-preview" src="https://github.com/user-attachments/assets/c99d50ff-dfe9-46a7-bc67-ebcb815fe2a5" />


A simple but powerful command-line tool to generate code snippets using the Google Gemini API.

## Features

* ✨ Generate code from a direct prompt.
* 🚀 Interactive mode for complex, multi-line prompts.
* 💾 Save generated code directly to a file.
* Pipe-friendly: Reads prompts from `stdin` (e.g., `cat prompt.txt | my-cli g`).
* Language-specific hints to improve AI output.
* Spinner/loading animations and rich, color-coded output.

## Installation

**1. Clone the Project**
```bash
git clone [https://github.com/your-username/my-swaggu-cli.git](https://github.com/your-username/my-swaggu-cli.git)
cd my-gemini-cli
```

**2. Install Dependencies**
```bash
npm install
# or
# bun install
```

**3. Set Your API Key**
You must have a Google Gemini API key.

1.  Get your key from [Google AI Studio](https://aistudio.google.com/app/apikey).
2.  Set it as an environment variable. Add this line to your `.bashrc`, `.zshrc`, or `.bash_profile`:

```bash
export GEMINI_API_KEY="YOUR_API_KEY_HERE"
```
3.  Reload your shell (e.g., `source ~/.zshrc`) or restart your terminal.

**4. Link the CLI**
This command makes your `my-cli` command available globally on your system.
```bash
npm link
```

## Usage

The main command is `my-cli generate` (or the alias `my-cli g`).

### Example 1: Basic Prompt
Provide a prompt directly as an argument.
```bash
my-cli g "a javascript function to reverse a string"
```

### Example 2: Specify Language
Use the `-l` flag to give the AI a hint.
```bash
my-swaggu-cli g -l python "a simple Flask server with one route"
```

### Example 3: Save to File
Use the `-o` flag to save the output.
```bash
my-swaggu-cli g -l javascript "a react component for a login form" -o ./LoginForm.jsx
# Output: ✔ Successfully saved to ./LoginForm.jsx
```

### Example 4: Interactive Mode (Best for Multi-line)
Use the `-i` flag to open your system's default text editor for writing a detailed prompt.
```bash
my-swaggu-cli g -i
# (Your $EDITOR opens...)
# After you save and quit, the prompt is sent.
```

### Example 5: Pipe from a File
If you have a prompt saved in a file, you can `cat` it directly to the CLI.
```bash
# Create a prompt file
echo "a CSS snippet for a card with a box-shadow" > myprompt.txt
# Pipe it!
cat myprompt.txt | my-swaggu-cli g -l css```

### Get Help
```bash
my-swaggu-cli --help
my-swaggu-cli generate --help
```
