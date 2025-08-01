# Peekaboo CLI Tips & Tricks

A collection of useful commands and workflows for the Peekaboo CLI tool.

## 📸 Screenshot Capture

### Basic Screenshots
```bash
# Capture a specific application
peekaboo image --app Safari --path screenshot.png

# Capture the frontmost window
peekaboo image --mode frontmost

# Capture entire screen
peekaboo image --mode screen --screen-index 0
```

### Pro Tips
- Use `--path` to save screenshots with custom names
- Omit `--path` to save with timestamp in current directory
- Use `--screen-index` with multi-monitor setups

## 🔍 System Information

### List Applications and Windows
```bash
# See all running applications
peekaboo list apps

# Find windows for a specific app
peekaboo list windows --app "Visual Studio Code"

# List all connected displays
peekaboo list screens
```

### Tip: Finding Window Names
When automating, first use `list windows` to get exact window titles for targeting.

## 🤖 AI-Powered Analysis

### Analyze Screenshots
```bash
# Ask questions about captured images
peekaboo image --analyze "What error is shown?" --path screenshot.png

# Analyze live application content
peekaboo image --analyze "Find all buttons" --app Safari
```

### Analysis Best Practices
- Be specific with your questions for better results
- Use for debugging UI issues
- Great for accessibility testing

## ⚙️ Configuration

### Setup Your Preferences
```bash
# Initialize config file
peekaboo config init

# Open config in your default editor
peekaboo config edit

# View current settings
peekaboo config show --effective
```

### Config Tips
- Set default screenshot directory
- Configure AI model preferences
- Customize output formats

## 💡 Workflow Examples

### Quick Bug Reporting
```bash
# Capture error and analyze in one command
peekaboo image --app "MyApp" --analyze "What error is displayed?" --path bug-report.png
```

### Multi-Monitor Screenshots
```bash
# List screens first
peekaboo list screens

# Then capture specific monitor
peekaboo image --mode screen --screen-index 1
```

### Application Documentation
```bash
# Capture all windows of an app
peekaboo list windows --app "YourApp" | while read window; do
    peekaboo image --app "YourApp" --path "doc-${window}.png"
done
```

## 🎯 Common Use Cases

1. **QA Testing**: Capture application states during test runs
2. **Documentation**: Screenshot UI elements for user guides
3. **Debugging**: Analyze error messages and UI issues
4. **Monitoring**: Periodically capture application states

## ⚡ Performance Tips

- Use `--mode frontmost` for faster captures when you don't need the full screen
- Specify `--app` directly instead of using screen mode when possible
- For batch operations, use shell scripts to automate multiple captures

## 🔧 Troubleshooting

- **Permission Issues**: Grant Screen Recording permission in System Preferences
- **App Not Found**: Use exact app name from `peekaboo list apps`
- **Multi-Screen Issues**: Use `list screens` to verify screen indices

## 📝 Notes

- Screenshots are saved in PNG format by default
- AI analysis requires internet connection
- Window names are case-sensitive