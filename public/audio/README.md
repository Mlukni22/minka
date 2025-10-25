# Minka Audio Files

This directory contains audio files for German vocabulary pronunciation.

## Audio File Structure

Audio files should be named according to the German word or phrase they represent, using kebab-case:

```
/audio/
  ├── hallo.mp3
  ├── wie-heisst-du.mp3
  ├── ich-heisse.mp3
  ├── ich-bin.mp3
  ├── guten-morgen.mp3
  └── ...
```

## Supported Formats

- **MP3** (recommended) - Best browser compatibility
- **OGG** - Alternative format
- **WAV** - Uncompressed, larger file size

## Audio Specifications

For best quality and performance:
- **Sample Rate**: 44.1 kHz or 48 kHz
- **Bit Rate**: 128 kbps (MP3)
- **Channels**: Mono (sufficient for voice)
- **Duration**: Keep recordings concise (1-3 seconds for words, 3-5 seconds for phrases)

## Fallback System

The Minka app includes a **Web Speech API fallback**:
- If an audio file is missing or fails to load, the app will automatically use the browser's built-in German text-to-speech
- This ensures users always hear pronunciation, even without audio files
- The fallback uses `lang: 'de-DE'` for German pronunciation

## Adding New Audio Files

1. Record or generate German audio pronunciation
2. Convert to MP3 format
3. Name the file using the German text (kebab-case)
4. Place in this `/public/audio/` directory
5. Update the vocabulary item in `story-engine.ts` with the audio path:

```typescript
{
  german: 'Hallo',
  english: 'Hello',
  audio: '/audio/hallo.mp3'  // ← Add this path
}
```

## Text-to-Speech Generation

You can generate audio files using:

### Online Services
- **Google Cloud Text-to-Speech** - High quality, German voices
- **Amazon Polly** - Multiple German voices (Marlene, Hans, Vicki)
- **Microsoft Azure Speech** - Neural voices available

### Free Tools
- **eSpeak** - Open-source TTS (command-line)
- **Festival** - Free TTS system
- **Piper** - Fast, local neural TTS

### Example: Google Cloud TTS (Python)

```python
from google.cloud import texttospeech

client = texttospeech.TextToSpeechClient()

text = "Hallo"
input_text = texttospeech.SynthesisInput(text=text)

voice = texttospeech.VoiceSelectionParams(
    language_code="de-DE",
    name="de-DE-Wavenet-A"
)

audio_config = texttospeech.AudioConfig(
    audio_encoding=texttospeech.AudioEncoding.MP3
)

response = client.synthesize_speech(
    input=input_text,
    voice=voice,
    audio_config=audio_config
)

with open(f"audio/{text.lower()}.mp3", "wb") as out:
    out.write(response.audio_content)
```

## Current Status

🔴 **Audio files not yet added** - The app currently uses Web Speech API fallback for all pronunciations.

To add audio files:
1. Generate or record audio for each vocabulary word
2. Place files in this directory
3. The app will automatically use them instead of the fallback

## Vocabulary Words Needed

Based on the current episodes, you'll need audio for approximately **100+ words and phrases**. Priority words from Episode 0:

- Hallo
- Wie heißt du?
- Ich heiße
- Ich bin
- Guten Morgen
- Wie geht's?
- Mir geht's gut
- Danke
- Bitte
- Tschüss

See `src/lib/story-engine.ts` for the complete list of vocabulary items.

## Testing Audio

To test if audio files are working:
1. Click the speaker icon next to any vocabulary word
2. Check the browser console for any loading errors
3. If an error occurs, the fallback TTS will activate automatically

## Notes

- Audio files are loaded on-demand (not preloaded)
- The app handles missing files gracefully with TTS fallback
- Users can replay audio multiple times by clicking the speaker icon
- Audio playback is controlled per-word (not auto-playing)

