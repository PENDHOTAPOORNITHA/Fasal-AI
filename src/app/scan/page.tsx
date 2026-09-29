"use client";

import "./scan.css";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  ImagePlus,
  Mic,
  MapPin,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { useRouter } from "next/navigation";

import {
  getLanguage,
  setLanguage as saveLanguage,
  type Language,
} from "@/lib/i18n";

const crops = [
  { name: "Rice", icon: "🌾" },
  { name: "Tomato", icon: "🍅" },
  { name: "Cotton", icon: "🌿" },
  { name: "Chilli", icon: "🌶️" },
  { name: "Maize", icon: "🌽" },
  { name: "Other", icon: "🌱" },
];

const states = [
  "Andhra Pradesh",
  "Telangana",
  "Maharashtra",
  "Karnataka",
  "Punjab",
];

const districts: Record<string, string[]> = {
  "Andhra Pradesh": [
    "Guntur",
    "Krishna",
    "Kurnool",
    "Prakasam",
    "Anantapur",
  ],
  Telangana: [
    "Hyderabad",
    "Warangal",
    "Nalgonda",
    "Karimnagar",
    "Khammam",
  ],
  Maharashtra: [
    "Nashik",
    "Pune",
    "Nagpur",
    "Aurangabad",
    "Kolhapur",
  ],
  Karnataka: [
    "Bengaluru Urban",
    "Mysuru",
    "Belagavi",
    "Dharwad",
    "Tumakuru",
  ],
  Punjab: [
    "Ludhiana",
    "Amritsar",
    "Patiala",
    "Bathinda",
    "Jalandhar",
  ],
};

const languages: {
  value: Language;
  label: string;
  speechCode: string;
}[] = [
  {
    value: "English",
    label: "English",
    speechCode: "en-IN",
  },
  {
    value: "Telugu",
    label: "తెలుగు",
    speechCode: "te-IN",
  },
  {
    value: "Hindi",
    label: "हिन्दी",
    speechCode: "hi-IN",
  },
];

type SpeechRecognitionEventLike = Event & {
  resultIndex: number;
  results: SpeechRecognitionResultList;
};

type SpeechRecognitionErrorEventLike = Event & {
  error: string;
};

type SpeechRecognitionInstance = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onstart:
    | (() => void)
    | null;
  onresult:
    | ((event: SpeechRecognitionEventLike) => void)
    | null;
  onerror:
    | ((event: SpeechRecognitionErrorEventLike) => void)
    | null;
  onend:
    | (() => void)
    | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructor =
  new () => SpeechRecognitionInstance;

type SpeechRecognitionWindow = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

type AnalysisStorage = {
  crop: string;
  state: string;
  district: string;
  language: Language;
  image: string | null;
  description: string;
  analysis: unknown;
  similarSignalCount?: number;
  clusterLevel?: string;
  clusterMessage?: string;
  regionalSignalCount?: number;
  affectedDistricts?: string[];
  districtCount?: number;
};

export default function ScanPage() {
  const router = useRouter();

  const [crop, setCrop] =
    useState("");

  const [state, setState] =
    useState("");

  const [district, setDistrict] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [language, setLanguage] =
    useState<Language>(() =>
      getLanguage()
    );

  /*
   * This remains the temporary browser URL
   * used only for the upload preview.
   *
   * The result page does NOT depend on this URL.
   */
  const [image, setImage] =
    useState<string | null>(null);

  const [imageFile, setImageFile] =
    useState<File | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [recording, setRecording] =
    useState(false);

  const recognitionRef =
    useRef<SpeechRecognitionInstance | null>(
      null
    );

  const shouldStopRecordingRef =
    useRef(false);

  const restartTimerRef =
    useRef<ReturnType<typeof setTimeout> | null>(
      null
    );

  const finalTranscriptRef =
    useRef("");

  const recognitionSessionRef =
    useRef(0);

  useEffect(() => {
    return () => {
      shouldStopRecordingRef.current =
        true;

      if (restartTimerRef.current) {
        clearTimeout(
          restartTimerRef.current
        );
      }

      try {
        recognitionRef.current?.stop();
      } catch {}

      recognitionRef.current = null;
    };
  }, []);

  const getSpeechCode = (
    selectedLanguage: Language
  ) => {
    return (
      languages.find(
        (item) =>
          item.value ===
          selectedLanguage
      )?.speechCode || "en-IN"
    );
  };

  const stopVoiceRecognition = () => {
    shouldStopRecordingRef.current =
      true;

    if (restartTimerRef.current) {
      clearTimeout(
        restartTimerRef.current
      );

      restartTimerRef.current = null;
    }

    try {
      recognitionRef.current?.stop();
    } catch {}

    recognitionRef.current = null;
    setRecording(false);
  };

  const startVoiceRecognition = () => {
    const speechWindow =
      window as SpeechRecognitionWindow;

    const SpeechRecognition =
      speechWindow.SpeechRecognition ||
      speechWindow.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "Voice recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge."
      );
      return;
    }

    shouldStopRecordingRef.current =
      false;

    const sessionId =
      ++recognitionSessionRef.current;

    const speechCode =
      getSpeechCode(language);

    try {
      const recognition =
        new SpeechRecognition();

      recognition.lang = speechCode;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        if (
          sessionId !==
          recognitionSessionRef.current
        ) {
          return;
        }

        console.log(
          "Voice recognition started:",
          speechCode
        );

        setRecording(true);
      };

      recognition.onresult = (
        event
      ) => {
        if (
          sessionId !==
          recognitionSessionRef.current
        ) {
          return;
        }

        let finalText = "";
        let interimText = "";

        for (
          let i = event.resultIndex;
          i < event.results.length;
          i++
        ) {
          const result =
            event.results[i];

          const text =
            result[0]?.transcript || "";

          if (result.isFinal) {
            finalText +=
              text + " ";
          } else {
            interimText +=
              text + " ";
          }
        }

        if (finalText.trim()) {
          finalTranscriptRef.current =
            `${finalTranscriptRef.current} ${finalText}`
              .replace(/\s+/g, " ")
              .trim();
        }

        const combinedText =
          `${finalTranscriptRef.current} ${interimText}`
            .replace(/\s+/g, " ")
            .trim();

        if (combinedText) {
          setDescription(
            combinedText
          );
        }
      };

      recognition.onerror = (
        event
      ) => {
        if (
          sessionId !==
          recognitionSessionRef.current
        ) {
          return;
        }

        console.error(
          "Speech recognition error:",
          event.error,
          event
        );

        if (
          event.error === "aborted"
        ) {
          return;
        }

        if (
          event.error ===
          "not-allowed"
        ) {
          shouldStopRecordingRef.current =
            true;

          setRecording(false);

          alert(
            "Microphone access was blocked. Please allow microphone access for this website in Chrome/Edge and try again."
          );

          return;
        }

        if (
          event.error ===
          "audio-capture"
        ) {
          shouldStopRecordingRef.current =
            true;

          setRecording(false);

          alert(
            "No microphone was detected. Please check your microphone and try again."
          );

          return;
        }

        if (
          event.error === "network"
        ) {
          shouldStopRecordingRef.current =
            true;

          setRecording(false);

          alert(
            "Voice recognition needs an internet connection. Please check your connection and try again."
          );

          return;
        }

        if (
          event.error ===
          "no-speech"
        ) {
          return;
        }

        console.warn(
          "Speech recognition warning:",
          event.error
        );
      };

      recognition.onend = () => {
        if (
          sessionId !==
          recognitionSessionRef.current
        ) {
          return;
        }

        console.log(
          "Voice recognition session ended."
        );

        if (
          !shouldStopRecordingRef.current
        ) {
          if (
            restartTimerRef.current
          ) {
            clearTimeout(
              restartTimerRef.current
            );
          }

          restartTimerRef.current =
            setTimeout(() => {
              restartTimerRef.current =
                null;

              if (
                shouldStopRecordingRef.current
              ) {
                return;
              }

              startVoiceRecognition();
            }, 150);
        } else {
          setRecording(false);
        }
      };

      recognitionRef.current =
        recognition;

      recognition.start();
    } catch (error) {
      console.error(
        "Unable to start speech recognition:",
        error
      );

      setRecording(false);

      alert(
        "Unable to start voice recording. Please allow microphone access and try again."
      );
    }
  };

  const toggleVoiceRecording = () => {
    if (recording) {
      stopVoiceRecognition();
      return;
    }

    if (!description.trim()) {
      finalTranscriptRef.current =
        "";
    } else {
      finalTranscriptRef.current =
        description.trim();
    }

    startVoiceRecognition();
  };

  const changeLanguage = (
    value: Language
  ) => {
    if (recording) {
      stopVoiceRecognition();
    }

    setLanguage(value);
    saveLanguage(value);
  };

  /*
   * Convert the uploaded image into a smaller,
   * persistent data URL.
   *
   * IMPORTANT:
   * This is used only for the result page.
   * The original blob URL remains untouched for
   * the upload preview.
   */
  const createResultImage = (
    file: File
  ): Promise<string> => {
    return new Promise(
      (resolve, reject) => {
        const reader =
          new FileReader();

        reader.onload = () => {
          const source =
            new window.Image();

          source.onload = () => {
            const maxDimension =
              1600;

            const scale =
              Math.min(
                1,
                maxDimension /
                  Math.max(
                    source.width,
                    source.height
                  )
              );

            const width =
              Math.max(
                1,
                Math.round(
                  source.width * scale
                )
              );

            const height =
              Math.max(
                1,
                Math.round(
                  source.height * scale
                )
              );

            const canvas =
              document.createElement(
                "canvas"
              );

            canvas.width = width;
            canvas.height = height;

            const context =
              canvas.getContext(
                "2d"
              );

            if (!context) {
              reject(
                new Error(
                  "Unable to prepare the crop image."
                )
              );
              return;
            }

            context.drawImage(
              source,
              0,
              0,
              width,
              height
            );

            const result =
              canvas.toDataURL(
                "image/jpeg",
                0.82
              );

            resolve(result);
          };

          source.onerror = () => {
            reject(
              new Error(
                "Unable to read the selected crop image."
              )
            );
          };

          source.src =
            String(reader.result);
        };

        reader.onerror = () => {
          reject(
            new Error(
              "Unable to prepare the crop image."
            )
          );
        };

        reader.readAsDataURL(file);
      }
    );
  };

  const handleImage = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) return;

    if (
      !file.type.startsWith(
        "image/"
      )
    ) {
      alert(
        "Please choose a valid image."
      );
      return;
    }

    if (
      file.size >
      10 * 1024 * 1024
    ) {
      alert(
        "Please choose an image smaller than 10MB."
      );
      return;
    }

    /*
     * Keep the existing preview behavior.
     */
    const previewUrl =
      URL.createObjectURL(file);

    setImage(previewUrl);
    setImageFile(file);
  };

  const removeImage = () => {
    /*
     * Clean up the temporary preview URL.
     */
    if (image) {
      URL.revokeObjectURL(image);
    }

    setImage(null);
    setImageFile(null);
  };

  const analyzeCrop = async () => {
    if (recording) {
      stopVoiceRecognition();
    }

    if (!crop) {
      alert(
        "Please select your crop."
      );
      return;
    }

    if (
      !image &&
      !description.trim()
    ) {
      alert(
        "Please upload a crop photo or describe the problem."
      );
      return;
    }

    setLoading(true);

    try {
      const formData =
        new FormData();

      formData.append(
        "crop",
        crop
      );

      formData.append(
        "state",
        state
      );

      formData.append(
        "district",
        district
      );

      formData.append(
        "description",
        description
      );

      formData.append(
        "language",
        language
      );

      if (imageFile) {
        formData.append(
          "image",
          imageFile
        );
      }

      const response =
        await fetch(
          "/api/analyze",
          {
            method: "POST",
            body: formData,
          }
        );

      const responseText =
        await response.text();

      console.log(
        "API STATUS:",
        response.status
      );

      console.log(
        "API RESPONSE:",
        responseText
      );

      let data: Record<
        string,
        unknown
      >;

      try {
        data =
          JSON.parse(
            responseText
          ) as Record<
            string,
            unknown
          >;
      } catch {
        throw new Error(
          `API returned invalid JSON. Status: ${response.status}`
        );
      }

      if (!response.ok) {
        throw new Error(
          typeof data.error ===
            "string"
            ? data.error
            : "Analysis failed."
        );
      }

      /*
       * IMPORTANT IMAGE FIX
       *
       * The old code stored:
       *
       *     image
       *
       * which was a blob:http://... URL.
       *
       * Blob URLs belong to the current browser
       * document and are not reliable after navigating
       * to /results.
       *
       * We now create a persistent compressed data URL
       * before navigating.
       */
      let resultImage: string | null =
        null;

      if (imageFile) {
        try {
          resultImage =
            await createResultImage(
              imageFile
            );
        } catch (imageError) {
          console.error(
            "Unable to prepare result image:",
            imageError
          );
        }
      }

      const storageData: AnalysisStorage =
        {
          crop,
          state,
          district,
          language,

          /*
           * This is now a persistent data URL,
           * NOT the temporary blob URL.
           */
          image: resultImage,

          description,
          analysis: data,

          similarSignalCount:
            typeof data.similarSignalCount ===
            "number"
              ? data.similarSignalCount
              : undefined,

          clusterLevel:
            typeof data.clusterLevel ===
            "string"
              ? data.clusterLevel
              : undefined,

          clusterMessage:
            typeof data.clusterMessage ===
            "string"
              ? data.clusterMessage
              : undefined,

          regionalSignalCount:
            typeof data.regionalSignalCount ===
            "number"
              ? data.regionalSignalCount
              : undefined,

          affectedDistricts:
            Array.isArray(
              data.affectedDistricts
            )
              ? data.affectedDistricts.filter(
                  (
                    item
                  ): item is string =>
                    typeof item ===
                    "string"
                )
              : undefined,

          districtCount:
            typeof data.districtCount ===
            "number"
              ? data.districtCount
              : undefined,
        };

      sessionStorage.setItem(
        "fasal-analysis",
        JSON.stringify(
          storageData
        )
      );

      /*
       * Use Next.js client navigation
       * instead of window.location.href.
       */
      router.push("/results");
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Something went wrong while analyzing the crop."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="scan-page">
      <div className="scan-topbar">
        <Link
          href="/"
          className="back-link"
        >
          <ArrowLeft size={17} />
          Back to Fasal AI
        </Link>

        <div className="scan-logo">
          <div className="scan-logo-mark">
            ✦
          </div>

          <span>
            Fasal<span>AI</span>
          </span>
        </div>
      </div>

      <section className="scan-header">
        <div className="scan-eyebrow">
          <span></span>
          AI CROP ASSESSMENT
        </div>

        <h1>
          Show us what&apos;s happening
          <em> in your field.</em>
        </h1>

        <p>
          Upload a crop photo, type the
          symptoms, or use your voice.
          Fasal AI helps identify possible
          crop problems and emerging
          regional patterns.
        </p>
      </section>

      <section className="scan-layout">
        <div className="scan-form">
          <div className="scan-section">
            <div className="scan-section-heading">
              <div>
                <span>01</span>
                <h2>
                  What are you growing?
                </h2>
              </div>

              <small>
                Select one
              </small>
            </div>

            <div className="crop-grid">
              {crops.map((item) => {
                const selected =
                  crop === item.name;

                return (
                  <button
                    key={item.name}
                    type="button"
                    className={`crop-card ${
                      selected
                        ? "crop-selected"
                        : ""
                    }`}
                    onClick={() =>
                      setCrop(
                        item.name
                      )
                    }
                  >
                    <span className="crop-icon">
                      {item.icon}
                    </span>

                    <span>
                      {item.name}
                    </span>

                    {selected && (
                      <span className="crop-check">
                        <Check
                          size={13}
                        />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="scan-section">
            <div className="scan-section-heading">
              <div>
                <span>02</span>
                <h2>
                  Where is your field?
                </h2>
              </div>

              <MapPin size={18} />
            </div>

            <div className="location-grid">
              <label>
                <span>State</span>

                <select
                  value={state}
                  onChange={(e) => {
                    setState(
                      e.target.value
                    );
                    setDistrict("");
                  }}
                >
                  <option value="">
                    Select state
                  </option>

                  {states.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}
                </select>
              </label>

              <label>
                <span>
                  District
                </span>

                <select
                  value={district}
                  onChange={(e) =>
                    setDistrict(
                      e.target.value
                    )
                  }
                  disabled={!state}
                >
                  <option value="">
                    Select district
                  </option>

                  {(
                    districts[
                      state
                    ] || []
                  ).map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}
                </select>
              </label>
            </div>

            <div className="privacy-note">
              <MapPin size={14} />

              <span>
                We use district-level
                information for regional
                agricultural intelligence.
                Your exact farm location
                is not required.
              </span>
            </div>
          </div>

          <div className="scan-section">
            <div className="scan-section-heading">
              <div>
                <span>03</span>
                <h2>
                  Show us the problem
                </h2>
              </div>
            </div>

            {!image ? (
              <label className="upload-box">
                <input
                  type="file"
                  accept="image/*"
                  onChange={
                    handleImage
                  }
                  hidden
                />

                <div className="upload-icon">
                  <ImagePlus
                    size={27}
                  />
                </div>

                <strong>
                  Upload a photo of
                  your crop
                </strong>

                <span>
                  Take a clear photo of
                  the affected leaf,
                  fruit, or plant.
                </span>

                <span className="upload-button">
                  <Upload
                    size={15}
                  />
                  Choose photo
                </span>

                <small>
                  JPG, PNG · Up to 10MB
                </small>
              </label>
            ) : (
              <div className="image-preview">
                <Image
                  src={image}
                  alt="Selected crop"
                  width={900}
                  height={650}
                  unoptimized
                />

                <button
                  type="button"
                  className="remove-image"
                  onClick={
                    removeImage
                  }
                  aria-label="Remove image"
                >
                  <X size={18} />
                </button>

                <div className="image-ready">
                  <Check size={15} />
                  Photo ready for
                  analysis
                </div>
              </div>
            )}

            <div className="or-divider">
              <span>OR</span>
            </div>

            <label className="description-label">
              <span>
                What are you noticing?
              </span>

              <textarea
                value={description}
                onChange={(e) => {
                  setDescription(
                    e.target.value
                  );

                  if (
                    !recording
                  ) {
                    finalTranscriptRef.current =
                      e.target.value;
                  }
                }}
                placeholder="Example: The leaves are turning yellow and I noticed small dark spots..."
                rows={5}
              />
            </label>

            <button
              type="button"
              className={`voice-button ${
                recording
                  ? "voice-recording"
                  : ""
              }`}
              onClick={
                toggleVoiceRecording
              }
            >
              <span className="voice-icon">
                <Mic size={18} />
              </span>

              <span>
                <strong>
                  {recording
                    ? "Listening..."
                    : "Describe it by voice"}
                </strong>

                <small>
                  {recording
                    ? `Speak in ${language}. Click again to stop.`
                    : "Telugu · Hindi · English"}
                </small>
              </span>

              {recording ? (
                <X size={17} />
              ) : (
                <ArrowRight
                  size={17}
                />
              )}
            </button>
          </div>

          <div className="scan-section">
            <div className="scan-section-heading">
              <div>
                <span>04</span>
                <h2>
                  How should we respond?
                </h2>
              </div>
            </div>

            <div className="language-options">
              {languages.map(
                (item) => {
                  const selected =
                    language ===
                    item.value;

                  return (
                    <button
                      key={
                        item.value
                      }
                      type="button"
                      className={`language-option ${
                        selected
                          ? "language-selected"
                          : ""
                      }`}
                      onClick={() =>
                        changeLanguage(
                          item.value
                        )
                      }
                    >
                      {item.label}

                      {selected && (
                        <Check
                          size={15}
                        />
                      )}
                    </button>
                  );
                }
              )}
            </div>
          </div>

          <button
            type="button"
            className={`analyze-button ${
              loading
                ? "analyzing"
                : ""
            }`}
            onClick={
              analyzeCrop
            }
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loader"></span>
                Fasal AI is examining
                your field...
              </>
            ) : (
              <>
                <Sparkles size={19} />
                Analyze My Crop
                <ArrowRight
                  size={18}
                />
              </>
            )}
          </button>

          <div className="trust-note">
            <Sparkles size={14} />
            AI-assisted assessment · Not a
            laboratory diagnosis
          </div>
        </div>

        <aside className="scan-side">
          <div className="side-card">
            <div className="side-card-top">
              <span className="side-status">
                <span></span>
                FASAL INTELLIGENCE
              </span>
            </div>

            <div className="side-illustration">
              <div className="illustration-sun"></div>

              <div className="illustration-field field-one"></div>

              <div className="illustration-field field-two"></div>

              <div className="illustration-field field-three"></div>

              <div className="illustration-plant">
                🌱
              </div>

              <div className="scan-circle">
                <span></span>
              </div>

              <div className="side-signal signal-one">
                <span></span>
              </div>

              <div className="side-signal signal-two">
                <span></span>
              </div>
            </div>

            <div className="side-content">
              <span className="side-label">
                WHAT HAPPENS NEXT
              </span>

              <h3>
                Your observation becomes
                <em> a signal.</em>
              </h3>

              <p>
                Fasal AI analyzes your
                crop observation and
                stores it as a
                privacy-conscious
                regional signal. Similar
                observations can then
                help identify emerging
                agricultural patterns.
              </p>

              <div className="signal-flow">
                <div>
                  <Camera size={17} />
                  <span>
                    Your crop
                  </span>
                </div>

                <ArrowRight
                  size={16}
                />

                <div>
                  <Sparkles size={17} />
                  <span>
                    AI insight
                  </span>
                </div>

                <ArrowRight
                  size={16}
                />

                <div>
                  <MapPin size={17} />
                  <span>
                    Regional signal
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="privacy-card">
            <div className="privacy-icon">
              <Check size={17} />
            </div>

            <div>
              <strong>
                Privacy by design
              </strong>

              <p>
                Fasal AI uses
                district-level signals
                and does not require
                your exact farm
                location.
              </p>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}