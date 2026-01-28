# 🚨 TROUBLESHOOTING GUIDE

## "No such file or directory" Error

This error usually means you're in the wrong folder or missing files. Here's how to fix it:

### Step 1: Make Sure You Cloned the Repository

**Open Terminal/Command Prompt and run:**

```bash
git clone https://github.com/Graceface-07/torn-war-bridge.git
```

You should see:
```
Cloning into 'torn-war-bridge'...
remote: Counting objects...
```

### Step 2: Navigate INTO the Folder

**IMPORTANT:** You must be INSIDE the torn-war-bridge folder!

```bash
cd torn-war-bridge
```

**Verify you're in the right place:**

```bash
# On Mac/Linux:
ls -la

# On Windows:
dir
```

You should see files like:
- server.js
- package.json
- start.sh (or start.bat on Windows)
- public/ (folder)

### Step 3: Run the Correct Command for Your OS

**On Mac/Linux:**
```bash
./start.sh
```

**On Windows:**
```bash
start.bat
```

**Or manually:**
```bash
npm install
node server.js
```

---

## Common Errors and Solutions

### Error: "npm: command not found"
**Problem:** Node.js is not installed

**Solution:**
1. Download Node.js from https://nodejs.org/
2. Install it
3. Restart your terminal
4. Try again

### Error: "node: command not found"
**Problem:** Node.js is not installed or not in PATH

**Solution:**
1. Download Node.js from https://nodejs.org/
2. Install it (make sure "Add to PATH" is checked)
3. Restart your terminal
4. Try again

### Error: "./start.sh: Permission denied"
**Problem:** Script not executable (Mac/Linux only)

**Solution:**
```bash
chmod +x start.sh
./start.sh
```

### Error: "Cannot find module 'express'"
**Problem:** Dependencies not installed

**Solution:**
```bash
npm install
```

### Error: "EACCES: permission denied"
**Problem:** You don't have write permissions in the current folder

**Solution:**
```bash
# Create the folder in your home directory
cd ~
git clone https://github.com/Graceface-07/torn-war-bridge.git
cd torn-war-bridge
npm install
node server.js
```

### Error: "EADDRINUSE: port 3000 already in use"
**Problem:** Another program is using port 3000

**Solution:**
1. **Option 1:** Stop the other program using port 3000
2. **Option 2:** Edit `server.js` and change line 7:
   ```javascript
   const port = 3001;  // Change to different port
   ```

---

## Verification Checklist

Before running, verify:

- [ ] You ran `git clone` successfully
- [ ] You ran `cd torn-war-bridge` (you're INSIDE the folder)
- [ ] You can see `server.js` when you run `ls` or `dir`
- [ ] Node.js is installed (run `node --version`)
- [ ] npm is installed (run `npm --version`)

---

## Still Not Working?

### Check Your Location
```bash
# See where you are
pwd

# Should show something like:
# /Users/yourname/torn-war-bridge
# or C:\Users\yourname\torn-war-bridge
```

### Check Files Exist
```bash
# On Mac/Linux:
ls -la public/

# On Windows:
dir public

# Should show:
# index.html
# dashboard.js
# status.html
# war-analysis.html
# war-analysis.js
```

### Manual Step-by-Step
If nothing works, try this ultra-detailed approach:

**1. Open a fresh terminal window**

**2. Go to your home directory:**
```bash
cd ~
```

**3. Clone the repository:**
```bash
git clone https://github.com/Graceface-07/torn-war-bridge.git
```

**4. WAIT for it to finish (you'll see "done")**

**5. Go into the folder:**
```bash
cd torn-war-bridge
```

**6. Verify you're in the right place:**
```bash
ls server.js
```
Should show: `server.js` (no error)

**7. Install dependencies:**
```bash
npm install
```
WAIT for it to finish (you'll see "packages" installed)

**8. Start the server:**
```bash
node server.js
```

**9. Open your browser:**
Go to: http://localhost:3000

---

## Platform-Specific Instructions

### 🍎 **macOS**
```bash
cd ~/Desktop
git clone https://github.com/Graceface-07/torn-war-bridge.git
cd torn-war-bridge
chmod +x start.sh
./start.sh
```

### 🪟 **Windows (Command Prompt)**
```cmd
cd %USERPROFILE%\Desktop
git clone https://github.com/Graceface-07/torn-war-bridge.git
cd torn-war-bridge
start.bat
```

### 🪟 **Windows (PowerShell)**
```powershell
cd $HOME\Desktop
git clone https://github.com/Graceface-07/torn-war-bridge.git
cd torn-war-bridge
.\start.bat
```

### 🐧 **Linux**
```bash
cd ~/Desktop
git clone https://github.com/Graceface-07/torn-war-bridge.git
cd torn-war-bridge
chmod +x start.sh
./start.sh
```

---

## Quick Test

To test if Node.js works, run:
```bash
node --version
npm --version
```

Both should show version numbers. If either shows "command not found", install Node.js first.

---

## Contact

If you're still stuck after trying everything above, check:
1. The main README.md file
2. The SETUP.md file  
3. Open an issue on GitHub with:
   - Your operating system (Mac/Windows/Linux)
   - The exact error message
   - What command you ran
   - Where you ran it from (`pwd` output)
