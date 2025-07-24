# Voice Input Guide

ChatBuddy includes advanced voice input capabilities using the Web Speech API, allowing you to speak your messages instead of typing them.

## 🎤 Getting Started

### Browser Compatibility
Voice input is supported in:
- ✅ **Chrome** (recommended)
- ✅ **Edge** (Chromium-based)
- ✅ **Safari** (macOS/iOS)
- ❌ **Firefox** (limited support)

### Enabling Voice Input

1. **Sign in** to your ChatBuddy account
2. Go to **Settings** → **Voice Input**
3. **Enable voice input** toggle
4. **Allow microphone access** when prompted by your browser

## 🔧 Configuration Options

### Language Settings
- **Default**: English (US)
- **Supported Languages**: 
  - English (US, UK, AU, CA)
  - Spanish (ES, MX, AR)
  - French (FR, CA)
  - German (DE)
  - Italian (IT)
  - Portuguese (PT, BR)
  - Japanese (JP)
  - Korean (KR)
  - Chinese (CN, TW)

### Voice Input Modes
- **Continuous**: Keeps listening until you stop manually
- **Single Command**: Stops after detecting speech pause
- **Push-to-Talk**: Hold button to speak (coming soon)

## 🎯 How to Use

### Basic Usage
1. **Click the microphone icon** in the chat input area
2. **Speak clearly** into your microphone
3. **Watch the transcript** appear in real-time
4. **Click stop** or let it auto-stop after silence
5. **Edit if needed** and send your message

### Voice Commands
While speaking, you can use these commands:
- **"Send message"** - Automatically sends the current transcript
- **"New line"** - Adds a line break
- **"Clear text"** - Clears the current input
- **"Stop listening"** - Stops voice input

### Best Practices
- **Speak clearly** and at normal pace
- **Minimize background noise** for better accuracy
- **Use punctuation commands**: "comma", "period", "question mark"
- **Pause briefly** between sentences for better recognition
- **Review transcript** before sending for accuracy

## 🔧 Troubleshooting

### Common Issues

#### "Microphone access denied"
**Solution**: 
1. Click the microphone icon in your browser's address bar
2. Select "Always allow" for ChatBuddy
3. Refresh the page and try again

#### "No speech detected"
**Possible causes**:
- Microphone is muted or not working
- Background noise is too loud
- Speaking too quietly
- Browser doesn't have microphone permission

**Solutions**:
- Check microphone settings in your OS
- Test microphone in other applications
- Move to a quieter environment
- Speak louder and clearer

#### "Voice input not available"
**Causes**:
- Browser doesn't support Web Speech API
- Using HTTP instead of HTTPS (required for voice)
- Browser extensions blocking microphone access

**Solutions**:
- Switch to Chrome or Edge
- Ensure you're using HTTPS
- Disable conflicting browser extensions

### Browser-Specific Issues

#### Chrome
- **Issue**: Voice stops working after tab switch
- **Solution**: Click in the chat input area to refocus

#### Safari
- **Issue**: Requires user interaction before first use
- **Solution**: Click the microphone button manually first time

#### Mobile Browsers
- **Issue**: Voice input may be limited on mobile
- **Solution**: Use desktop browser for best experience

## 🛡️ Privacy & Security

### Data Handling
- **Voice data** is processed locally by your browser
- **No audio** is sent to ChatBuddy servers
- **Only text transcripts** are stored with your messages
- **Microphone access** can be revoked at any time

### Permissions
- **Microphone access** is required for voice input
- **Permissions** are managed by your browser
- **Access** can be revoked in browser settings
- **No persistent recording** - only active during use

## ⚙️ Advanced Settings

### Noise Cancellation
- **Automatic**: Browser handles noise reduction
- **Manual**: Adjust microphone sensitivity in OS settings
- **External**: Use noise-canceling headphones for best results

### Custom Vocabulary
- **Technical terms**: Spell out complex words first time
- **Names**: Speak slowly for proper recognition
- **Acronyms**: Spell letter by letter ("A-P-I" for API)

### Integration with Chat Modes
- **Technical mode**: Better recognition of code-related terms
- **Learning mode**: Optimized for educational vocabulary
- **Creative mode**: Enhanced recognition of descriptive language

## 🔮 Future Features

### Planned Enhancements
- **Voice commands** for chat navigation
- **Custom wake words** for hands-free activation
- **Voice shortcuts** for common phrases
- **Multi-language mixing** in single conversation
- **Voice-to-code** for programming languages
- **Offline voice recognition** (when browser support improves)

## 📱 Mobile Considerations

### iOS Safari
- **Requires** user interaction to start
- **Works best** in full-screen mode
- **May pause** during app switching

### Android Chrome
- **Full support** for voice input
- **Background processing** may be limited
- **Works** with screen keyboard hidden

## 🆘 Getting Help

If you're experiencing issues with voice input:

1. **Check browser compatibility** above
2. **Review troubleshooting** section
3. **Test microphone** in other applications
4. **Contact support** with specific error messages
5. **Check browser console** for technical errors

---

**Note**: Voice input technology is rapidly evolving. This guide will be updated as new features and browser support become available.