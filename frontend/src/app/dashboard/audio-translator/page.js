"use client";

import { useEffect, useRef, useState } from "react";

const AI_API =
  process.env.NEXT_PUBLIC_AI_API_BASE_URL;

const LANGUAGES = [
  { code: "en-IN", label: "English" },
  { code: "hi-IN", label: "Hindi (हिंदी)" },
  { code: "te-IN", label: "Telugu (తెలుగు)" },
  { code: "ta-IN", label: "Tamil (தமிழ்)" },
  { code: "kn-IN", label: "Kannada (ಕನ್ನಡ)" },
  { code: "ml-IN", label: "Malayalam (മലയാളം)" },
  { code: "mr-IN", label: "Marathi (मराठी)" },
  { code: "bn-IN", label: "Bengali (বাংলা)" },
];

function getUserEmail() {
  if (typeof window === "undefined") return "";

  try {
    const auth = JSON.parse(
      localStorage.getItem("swais_faculty_auth") || "{}"
    );

    return auth?.email || "";
  } catch {
    return "";
  }
}

function getCleanLanguage(languages, languageCode) {
  const label =
    languages.find(
      (language) => language.code === languageCode
    )?.label || languageCode;

  return label
    .replace(/\s*\([^)]*\)\s*/g, "")
    .trim();
}

export default function AudioTranslatorPage() {
  const [sourceLang, setSourceLang] =
    useState("en-IN");

  const [targetLang, setTargetLang] =
    useState("hi-IN");

  const [isRecording, setIsRecording] =
    useState(false);

  const [recordingTime, setRecordingTime] =
    useState(0);

  const [recordedAudio, setRecordedAudio] =
    useState(null);

  const [transcript, setTranscript] =
    useState("");

  const [translatedText, setTranslatedText] =
    useState("");

  const [translatedAudio, setTranslatedAudio] =
    useState("");

  const [isTranslating, setIsTranslating] =
    useState(false);

  const [isSpeaking, setIsSpeaking] =
    useState(false);

  const [error, setError] =
    useState("");

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const activeAudioRef = useRef(null);

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);

      if (
        mediaRecorderRef.current?.state ===
        "recording"
      ) {
        mediaRecorderRef.current.stop();
      }

      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
        activeAudioRef.current = null;
      }

      window.speechSynthesis?.cancel();
    };
  }, []);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(
      2,
      "0"
    )}:${String(remainingSeconds).padStart(
      2,
      "0"
    )}`;
  };

  const handleRecord = async () => {
    if (isRecording) {
      if (
        mediaRecorderRef.current?.state ===
        "recording"
      ) {
        mediaRecorderRef.current.stop();
      }

      return;
    }

    try {
      setError("");
      setTranscript("");
      setTranslatedText("");
      setTranslatedAudio("");
      setRecordedAudio(null);
      setRecordingTime(0);

      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

      const recorder = new MediaRecorder(stream);

      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data?.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        stream
          .getTracks()
          .forEach((track) => track.stop());

        clearInterval(timerRef.current);
        timerRef.current = null;

        setIsRecording(false);

        const audioType =
          recorder.mimeType || "audio/webm";

        const audioBlob = new Blob(
          audioChunksRef.current,
          {
            type: audioType,
          }
        );

        if (audioBlob.size === 0) {
          setError(
            "No audio was recorded. Please try again."
          );
          return;
        }

        const extension =
          audioType.includes("ogg")
            ? "ogg"
            : audioType.includes("mp4")
              ? "mp4"
              : "webm";

        const audioFile = new File(
          [audioBlob],
          `faculty-recording.${extension}`,
          {
            type: audioType,
          }
        );

        setRecordedAudio(audioFile);
      };

      recorder.onerror = () => {
        stream
          .getTracks()
          .forEach((track) => track.stop());

        clearInterval(timerRef.current);
        timerRef.current = null;

        setIsRecording(false);
        setError(
          "Recording failed. Please try again."
        );
      };

      mediaRecorderRef.current = recorder;

      recorder.start();
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        setRecordingTime(
          (currentTime) => currentTime + 1
        );
      }, 1000);

      // Automatically stop after 10 seconds.
      setTimeout(() => {
        if (
          mediaRecorderRef.current?.state ===
          "recording"
        ) {
          mediaRecorderRef.current.stop();
        }
      }, 10000);
    } catch (recordingError) {
      console.error(
        "MICROPHONE ERROR:",
        recordingError
      );

      setIsRecording(false);
      setError(
        recordingError?.message ||
          "Unable to access the microphone."
      );
    }
  };

  const handleTranslate = async () => {
    if (!recordedAudio) {
      setError(
        "Please record audio before translating."
      );
      return;
    }

    setIsTranslating(true);
    setError("");
    setTranscript("");
    setTranslatedText("");
    setTranslatedAudio("");

    try {
      const sourceLanguage = getCleanLanguage(
        LANGUAGES,
        sourceLang
      );

      const targetLanguage = getCleanLanguage(
        LANGUAGES,
        targetLang
      );

      const userEmail =
        getUserEmail() ||
        "sandipani.acharya@swais.edu";

      const formData = new FormData();

      formData.append("file", recordedAudio);

      formData.append(
        "source_language",
        sourceLanguage
      );

      formData.append(
        "target_language",
        targetLanguage
      );

      formData.append(
        "user_email",
        userEmail
      );

      formData.append(
        "client_name",
        "SSS"
      );

      const response = await fetch(
        `${AI_API}/api/faculty/audio-translator`,
        {
          method: "POST",
          body: formData,
        }
      );

      const responseText =
        await response.text();

      let data;

      try {
        data = responseText
          ? JSON.parse(responseText)
          : {};
      } catch {
        data = responseText;
      }
      

      if (!response.ok) {
        const detail =
          typeof data?.detail === "string"
            ? data.detail
            : data?.detail
              ? JSON.stringify(data.detail)
              : typeof data === "string"
                ? data
                : `HTTP ${response.status}`;

        throw new Error(detail);
      }

      const responseData = data?.data ?? data ?? {};

      const originalTranscript =
        responseData?.transcription ??
        responseData?.transcript ??
        responseData?.source_text ??
        responseData?.original_text ??
        "";

      const translation =
        responseData?.translated_text ??
        responseData?.translatedText ??
        responseData?.translation ??
        responseData?.result ??
        "";

      const audioBase64 =
        responseData?.audio_base64 ??
        responseData?.translated_audio_base64 ??
        responseData?.translated_audio ??
        "";
      setTranscript(originalTranscript);

      if (translation) {
        setTranslatedText(translation);
      } else {
        setError(
          "Audio was processed, but translated text was not returned."
        );
      }

      if (audioBase64) {
        setTranslatedAudio(
          `data:audio/mpeg;base64,${audioBase64}`
        );
      }
    } catch (translationError) {
      console.error(
        "AUDIO TRANSLATOR FAILED:",
        translationError
      );

      setError(
        translationError?.message ||
          "Audio translation failed. Please try again."
      );
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSpeak = async () => {
    if (isSpeaking) {
      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
        activeAudioRef.current.currentTime = 0;
        activeAudioRef.current = null;
      }

      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
      return;
    }

    if (translatedAudio) {
      try {
        const audio =
          new Audio(translatedAudio);

        activeAudioRef.current = audio;

        audio.onended = () => {
          setIsSpeaking(false);
          activeAudioRef.current = null;
        };

        audio.onerror = () => {
          setIsSpeaking(false);
          activeAudioRef.current = null;
        };

        setIsSpeaking(true);
        await audio.play();
        return;
      } catch (audioError) {
        console.warn(
          "Translated audio playback failed:",
          audioError
        );
      }
    }

    if (!translatedText) return;

    window.speechSynthesis.cancel();

    const utterance =
      new SpeechSynthesisUtterance(
        translatedText
      );

    utterance.lang = targetLang;

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
          style={{
            background:
              "linear-gradient(135deg,#8B5CF6,#06B6D4)",
          }}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-7V4a3 3 0 00-3-3H9"
            />
          </svg>
        </div>

        <div>
          <h1
            className="text-2xl font-bold"
            style={{
              color: "#ffffff",
              fontFamily:
                "var(--font-space-grotesk)",
            }}
          >
            Audio Language Translator
          </h1>

          <p
            className="text-sm"
            style={{ color: "#94A3B8" }}
          >
            Speak in one language, hear it in
            another
          </p>
        </div>

        <span
          className="ml-auto text-xs font-semibold px-3 py-1 rounded-full"
          style={{
            background: "#ECFDF5",
            color: "#10B981",
            border: "1px solid #A7F3D0",
          }}
        >
          AI Connected
        </span>
      </div>

      {/* Language selection */}
      <div
        className="bg-white rounded-2xl p-4 flex items-center gap-4 flex-wrap"
        style={{
          border:
            "1px solid rgba(99,102,241,0.1)",
        }}
      >
        <div className="flex-1 min-w-[140px]">
          <label
            className="text-xs font-semibold block mb-1.5"
            style={{ color: "#64748B" }}
          >
            Speak in
          </label>

          <select
            value={sourceLang}
            onChange={(event) =>
              setSourceLang(event.target.value)
            }
            disabled={isRecording}
            className="w-full text-sm rounded-xl px-3 py-2 outline-none cursor-pointer"
            style={{
              border: "1px solid #E2E8F0",
              color: "#0F172A",
              background: "#F8FAFC",
            }}
          >
            {LANGUAGES.map((language) => (
              <option
                key={language.code}
                value={language.code}
              >
                {language.label}
              </option>
            ))}
          </select>
        </div>

        <div
          className="mt-5 flex items-center"
          style={{ color: "#94A3B8" }}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 5l7 7-7 7M5 5l7 7-7 7"
            />
          </svg>
        </div>

        <div className="flex-1 min-w-[140px]">
          <label
            className="text-xs font-semibold block mb-1.5"
            style={{ color: "#64748B" }}
          >
            Translate to
          </label>

          <select
            value={targetLang}
            onChange={(event) =>
              setTargetLang(event.target.value)
            }
            disabled={isRecording}
            className="w-full text-sm rounded-xl px-3 py-2 outline-none cursor-pointer"
            style={{
              border: "1px solid #E2E8F0",
              color: "#0F172A",
              background: "#F8FAFC",
            }}
          >
            {LANGUAGES.filter(
              (language) =>
                language.code !== sourceLang
            ).map((language) => (
              <option
                key={language.code}
                value={language.code}
              >
                {language.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Recording panel */}
      <div
        className="bg-white rounded-2xl p-8 flex flex-col items-center gap-6"
        style={{
          border:
            "1px solid rgba(99,102,241,0.1)",
        }}
      >
        <div className="relative">
          {isRecording && (
            <div
              className="absolute inset-0 rounded-full animate-ping opacity-30"
              style={{
                background: "#EF4444",
                transform: "scale(1.4)",
              }}
            />
          )}

          <button
            type="button"
            onClick={handleRecord}
            disabled={isTranslating}
            className="relative w-24 h-24 rounded-full flex items-center justify-center text-white transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"
            style={{
              background: isRecording
                ? "linear-gradient(135deg,#EF4444,#DC2626)"
                : "linear-gradient(135deg,#6366F1,#8B5CF6)",
              transform: isRecording
                ? "scale(1.05)"
                : "scale(1)",
            }}
          >
            <svg
              className="w-10 h-10"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isRecording ? (
                <rect
                  x="6"
                  y="6"
                  width="12"
                  height="12"
                  rx="2"
                  strokeWidth={2}
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-7V4a3 3 0 00-3-3H9"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Recording status */}
        <div className="text-center">
          {isRecording ? (
            <>
              <p
                className="text-sm font-semibold"
                style={{ color: "#EF4444" }}
              >
                Recording…{" "}
                {formatTime(recordingTime)}
              </p>

              <p
                className="text-xs mt-1"
                style={{ color: "#94A3B8" }}
              >
                Tap the button to stop
              </p>
            </>
          ) : recordedAudio ? (
            <>
              <p
                className="text-sm font-semibold"
                style={{ color: "#10B981" }}
              >
                Recording completed
              </p>

              <p
                className="text-xs mt-1"
                style={{ color: "#94A3B8" }}
              >
                Click Translate to process the
                audio
              </p>
            </>
          ) : (
            <>
              <p
                className="text-sm font-semibold"
                style={{ color: "#64748B" }}
              >
                Tap to start recording
              </p>

              <p
                className="text-xs mt-1"
                style={{ color: "#94A3B8" }}
              >
                Speak clearly in{" "}
                {
                  LANGUAGES.find(
                    (language) =>
                      language.code === sourceLang
                  )?.label
                }
              </p>
            </>
          )}
        </div>

        {recordedAudio && !isRecording && (
          <button
            type="button"
            onClick={handleTranslate}
            disabled={isTranslating}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background:
                "linear-gradient(135deg,#6366F1,#8B5CF6)",
            }}
          >
            {isTranslating
              ? "Translating…"
              : `Translate to ${
                  LANGUAGES.find(
                    (language) =>
                      language.code ===
                      targetLang
                  )?.label
                } →`}
          </button>
        )}

        {error && (
          <div
            className="w-full p-3 rounded-xl text-sm"
            style={{
              background: "#FEF2F2",
              color: "#DC2626",
              border: "1px solid #FECACA",
            }}
          >
            {error}
          </div>
        )}

        {transcript && (
          <div
            className="w-full p-4 rounded-xl"
            style={{
              background: "#F8FAFC",
              border: "1px solid #E2E8F0",
            }}
          >
            <p
              className="text-xs font-semibold mb-1"
              style={{ color: "#64748B" }}
            >
              Transcribed
            </p>

            <p
              className="text-sm"
              style={{ color: "#0F172A" }}
            >
              {transcript}
            </p>
          </div>
        )}
      </div>

      {/* Translation result */}
      {(isTranslating || translatedText) && (
        <div
          className="bg-white rounded-2xl p-6"
          style={{
            border:
              "1px solid rgba(99,102,241,0.1)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <p
              className="text-sm font-semibold"
              style={{ color: "#64748B" }}
            >
              Translation —{" "}
              {
                LANGUAGES.find(
                  (language) =>
                    language.code === targetLang
                )?.label
              }
            </p>

            {translatedText && (
              <button
                type="button"
                onClick={handleSpeak}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                style={{
                  background: isSpeaking
                    ? "#EF4444"
                    : "#EEF2FF",
                  color: isSpeaking
                    ? "white"
                    : "#6366F1",
                }}
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.536 8.464a5 5 0 010 7.072M12 6v12"
                  />
                </svg>

                {isSpeaking
                  ? "Stop"
                  : "Listen"}
              </button>
            )}
          </div>

          {isTranslating ? (
            <div className="space-y-2">
              <div className="skeleton h-3 w-full rounded" />
              <div className="skeleton h-3 w-4/5 rounded" />
              <div className="skeleton h-3 w-3/5 rounded" />
            </div>
          ) : (
            <p
              className="text-sm whitespace-pre-wrap"
              style={{
                color: "#0F172A",
                lineHeight: "1.7",
              }}
            >
              {translatedText}
            </p>
          )}
        </div>
      )}
    </div>
  );
}