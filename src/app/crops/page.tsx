"use client";

import "./crops.css";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import {
  CalendarDays,
  ChevronRight,
  Droplets,
  Leaf,
  Plus,
  Sprout,
  Trash2,
  X,
} from "lucide-react";
import FasalNavbar from "@/components/FasalNavbar";

type Crop = {
  id: string;
  name: string;
  variety: string;
  field: string;
  area: string;
  plantingDate: string;
  harvestDate: string;
  growthStage: string;
  irrigation: string;
};

const STORAGE_KEY = "fasal-my-crops";
const STORAGE_EVENT = "fasal-crops-updated";

const DEMO_CROPS: Crop[] = [
  {
    id: "demo-maize",
    name: "Maize",
    variety: "DHM 117",
    field: "Field A",
    area: "2",
    plantingDate: "2026-07-31",
    harvestDate: "2026-10-15",
    growthStage: "Vegetative",
    irrigation: "Drip",
  },
  {
    id: "demo-cotton",
    name: "Cotton",
    variety: "RCH 659",
    field: "Field B",
    area: "1.5",
    plantingDate: "2026-07-01",
    harvestDate: "2026-11-20",
    growthStage: "Flowering",
    irrigation: "Drip",
  },
  {
    id: "demo-paddy",
    name: "Paddy",
    variety: "BPT 5204",
    field: "Field C",
    area: "1",
    plantingDate: "2026-07-06",
    harvestDate: "2026-10-20",
    growthStage: "Vegetative",
    irrigation: "Flood",
  },
  {
    id: "demo-chilli",
    name: "Chilli",
    variety: "Teja",
    field: "Field D",
    area: "0.7",
    plantingDate: "2026-08-21",
    harvestDate: "2026-12-20",
    growthStage: "Vegetative",
    irrigation: "Drip",
  },
  {
    id: "demo-groundnut",
    name: "Groundnut",
    variety: "Kadiri 6",
    field: "Field E",
    area: "1",
    plantingDate: "2026-07-10",
    harvestDate: "2026-10-10",
    growthStage: "Flowering",
    irrigation: "Rainfed",
  },
];

const defaultForm: Omit<Crop, "id"> = {
  name: "",
  variety: "",
  field: "",
  area: "",
  plantingDate: "",
  harvestDate: "",
  growthStage: "Seedling",
  irrigation: "Drip",
};

const growthStages = [
  "Seedling",
  "Vegetative",
  "Flowering",
  "Fruiting",
  "Maturity",
  "Harvest Ready",
];

const irrigationTypes = [
  "Drip",
  "Sprinkler",
  "Flood",
  "Rainfed",
  "Manual",
];

function getDaysBetween(start: string, end: string) {
  if (!start || !end) return 0;

  const startDate = new Date(start);
  const endDate = new Date(end);

  const difference = endDate.getTime() - startDate.getTime();

  return Math.max(
    0,
    Math.ceil(difference / (1000 * 60 * 60 * 24))
  );
}

function getDaysSincePlanting(date: string) {
  if (!date) return 0;

  const planted = new Date(date);
  const today = new Date();

  const difference = today.getTime() - planted.getTime();

  return Math.max(
    0,
    Math.floor(difference / (1000 * 60 * 60 * 24))
  );
}

function getHarvestStatus(harvestDate: string) {
  if (!harvestDate) {
    return {
      label: "Harvest date not set",
      className: "neutral",
    };
  }

  const today = new Date();
  const harvest = new Date(harvestDate);

  const difference = harvest.getTime() - today.getTime();

  const days = Math.ceil(
    difference / (1000 * 60 * 60 * 24)
  );

  if (days < 0) {
    return {
      label: "Harvest overdue",
      className: "danger",
    };
  }

  if (days <= 7) {
    return {
      label: `Harvest in ${days} day${days === 1 ? "" : "s"}`,
      className: "warning",
    };
  }

  return {
    label: `Harvest in ${days} days`,
    className: "success",
  };
}

function readStoredCrops(): Crop[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return [];
    }

    const parsed = JSON.parse(saved);

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Failed to load crops:", error);
    return [];
  }
}

function subscribeToCrops(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(STORAGE_EVENT, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(STORAGE_EVENT, callback);
  };
}

function getCropsSnapshot() {
  return JSON.stringify(readStoredCrops());
}

function getServerCropsSnapshot() {
  return "[]";
}

function formatDate(date: string) {
  if (!date) return "Not specified";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function CropsPage() {
  useEffect(() => {
    const existing = window.localStorage.getItem(STORAGE_KEY);

    if (!existing) {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(DEMO_CROPS)
      );

      window.dispatchEvent(new Event(STORAGE_EVENT));
    }
  }, []);

  const storedCrops = useSyncExternalStore(
    subscribeToCrops,
    getCropsSnapshot,
    getServerCropsSnapshot
  );

  const crops = useMemo<Crop[]>(() => {
    try {
      const parsed = JSON.parse(storedCrops);

      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [storedCrops]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const [form, setForm] = useState(defaultForm);

  const saveCrops = (updatedCrops: Crop[]) => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updatedCrops)
      );

      window.dispatchEvent(new Event(STORAGE_EVENT));
    } catch (error) {
      console.error("Failed to save crops:", error);
    }
  };

  const handleAddCrop = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.name.trim()) {
      return;
    }

    const newCrop: Crop = {
      id: `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 9)}`,
      name: form.name.trim(),
      variety: form.variety.trim(),
      field: form.field.trim(),
      area: form.area.trim(),
      plantingDate: form.plantingDate,
      harvestDate: form.harvestDate,
      growthStage: form.growthStage,
      irrigation: form.irrigation,
    };

    saveCrops([...crops, newCrop]);

    setForm(defaultForm);
    setShowAddModal(false);
  };

  const handleDeleteCrop = (id: string) => {
    const crop = crops.find((item) => item.id === id);

    if (!crop) {
      return;
    }

    const shouldDelete = window.confirm(
      `Delete ${crop.name} from My Crops?`
    );

    if (!shouldDelete) {
      return;
    }

    const updatedCrops = crops.filter(
      (item) => item.id !== id
    );

    saveCrops(updatedCrops);

    if (selectedCrop?.id === id) {
      setSelectedCrop(null);
    }
  };

  const totalArea = useMemo(() => {
    return crops.reduce((total, crop) => {
      const numericArea = Number.parseFloat(crop.area);

      return (
        total +
        (Number.isNaN(numericArea) ? 0 : numericArea)
      );
    }, 0);
  }, [crops]);

  const upcomingHarvests = useMemo(() => {
    return crops.filter((crop) => {
      if (!crop.harvestDate) return false;

      const today = new Date();
      const harvestDate = new Date(crop.harvestDate);

      const difference =
        harvestDate.getTime() - today.getTime();

      const days = Math.ceil(
        difference / (1000 * 60 * 60 * 24)
      );

      return days >= 0 && days <= 30;
    }).length;
  }, [crops]);

  const activeCrops = useMemo(() => {
    return crops.filter(
      (crop) => crop.growthStage !== "Harvest Ready"
    ).length;
  }, [crops]);

  const updateForm = (
    field: keyof Omit<Crop, "id">,
    value: string
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  return (
    <main className="crops-page">
      <FasalNavbar />

      <div className="crops-container">
        <header className="crops-header">
          <div className="crops-header-left">
            <div className="crops-heading">
              <div className="crops-title-icon">
                <Sprout size={25} />
              </div>

              <div className="crops-heading-copy">
                <p className="crops-eyebrow">
                  FARM MANAGEMENT
                </p>

                <h1>My Crops</h1>

                <p className="crops-subtitle">
                  Keep track of your crops, fields and harvest
                  schedule.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="primary-crop-button"
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={18} />
            Add Crop
          </button>
        </header>

        <section className="crop-overview">
          <div className="overview-card">
            <div className="overview-icon">
              <Leaf size={21} />
            </div>

            <div className="overview-content">
              <span>Total Crops</span>
              <strong>{crops.length}</strong>
            </div>
          </div>

          <div className="overview-card">
            <div className="overview-icon">
              <Sprout size={21} />
            </div>

            <div className="overview-content">
              <span>Active Crops</span>
              <strong>{activeCrops}</strong>
            </div>
          </div>

          <div className="overview-card">
            <div className="overview-icon">
              <CalendarDays size={21} />
            </div>

            <div className="overview-content">
              <span>Harvests ≤ 30 Days</span>
              <strong>{upcomingHarvests}</strong>
            </div>
          </div>

          <div className="overview-card">
            <div className="overview-icon">
              <Droplets size={21} />
            </div>

            <div className="overview-content">
              <span>Total Farm Area</span>

              <strong>
                {totalArea > 0 ? `${totalArea} ac` : "—"}
              </strong>
            </div>
          </div>
        </section>

        <section className="crops-main-section">
          <div className="section-heading">
            <div className="section-heading-text">
              <p className="section-kicker">YOUR FARM</p>

              <h2>Crop Portfolio</h2>

              <p className="section-description">
                Monitor growth, irrigation and harvest timing
                for every crop.
              </p>
            </div>

            {crops.length > 0 && (
              <button
                type="button"
                className="small-add-button"
                onClick={() => setShowAddModal(true)}
              >
                <Plus size={16} />
                Add another
              </button>
            )}
          </div>

          {crops.length === 0 ? (
            <div className="empty-crops">
              <div className="empty-crops-icon">
                <Sprout size={42} />
              </div>

              <h3>No crops added yet</h3>

              <p>
                Add your first crop to start tracking its
                growth, irrigation and harvest schedule.
              </p>

              <button
                type="button"
                className="primary-crop-button"
                onClick={() => setShowAddModal(true)}
              >
                <Plus size={18} />
                Add Your First Crop
              </button>
            </div>
          ) : (
            <div className="crop-grid">
              {crops.map((crop) => {
                const harvestStatus = getHarvestStatus(
                  crop.harvestDate
                );

                const daysSincePlanting =
                  getDaysSincePlanting(
                    crop.plantingDate
                  );

                const totalGrowingDays = getDaysBetween(
                  crop.plantingDate,
                  crop.harvestDate
                );

                const progress =
                  totalGrowingDays > 0
                    ? Math.min(
                        100,
                        Math.round(
                          (daysSincePlanting /
                            totalGrowingDays) *
                            100
                        )
                      )
                    : 0;

                return (
                  <article
                    className="crop-card"
                    key={crop.id}
                  >
                    <div className="crop-card-top">
                      <div className="crop-card-icon">
                        <Leaf size={21} />
                      </div>

                      <div className="crop-card-actions">
                        <button
                          type="button"
                          className="icon-action-button"
                          onClick={() =>
                            handleDeleteCrop(crop.id)
                          }
                          aria-label={`Delete ${crop.name}`}
                          title="Delete crop"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="crop-card-title">
                      <div className="crop-name-block">
                        <h3>{crop.name}</h3>

                        {crop.variety && (
                          <p>{crop.variety}</p>
                        )}
                      </div>

                      <span
                        className={`crop-status ${harvestStatus.className}`}
                      >
                        {harvestStatus.label}
                      </span>
                    </div>

                    <div className="crop-meta">
                      <div className="crop-meta-item">
                        <span className="crop-meta-label">
                          Field
                        </span>

                        <strong className="crop-meta-value">
                          {crop.field || "Not specified"}
                        </strong>
                      </div>

                      <div className="crop-meta-item">
                        <span className="crop-meta-label">
                          Area
                        </span>

                        <strong className="crop-meta-value">
                          {crop.area
                            ? `${crop.area} ac`
                            : "Not specified"}
                        </strong>
                      </div>
                    </div>

                    <div className="growth-section">
                      <div className="growth-header">
                        <span>Growth Progress</span>

                        <strong>
                          {progress}%
                        </strong>
                      </div>

                      <div
                        className="growth-bar"
                        aria-label={`Growth progress ${progress}%`}
                      >
                        <div
                          className="growth-bar-fill"
                          style={{
                            width: `${progress}%`,
                          }}
                        />
                      </div>

                      <div className="growth-stage-row">
                        <span>{crop.growthStage}</span>

                        {daysSincePlanting > 0 && (
                          <span>
                            Day {daysSincePlanting}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="crop-details-row">
                      <div className="crop-detail-item">
                        <CalendarDays size={15} />

                        <span>
                          {crop.harvestDate
                            ? formatDate(
                                crop.harvestDate
                              )
                            : "No harvest date"}
                        </span>
                      </div>

                      <div className="crop-detail-item">
                        <Droplets size={15} />

                        <span>
                          {crop.irrigation || "Not set"}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="view-crop-button"
                      onClick={() =>
                        setSelectedCrop(crop)
                      }
                    >
                      <span>
                        View crop details
                      </span>

                      <ChevronRight size={17} />
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="crop-intelligence">
          <div className="intelligence-icon">
            <Sprout size={23} />
          </div>

          <div className="intelligence-content">
            <p className="section-kicker">
              FARM INTELLIGENCE
            </p>

            <h2>
              Connected crop information
            </h2>

            <p>
              Your crop details can support personalized
              irrigation reminders, weather risk alerts,
              disease monitoring, fertilizer guidance and
              harvest planning across Fasal AI.
            </p>

            <div className="intelligence-tags">
              <span>Weather Risk</span>
              <span>Irrigation</span>
              <span>Pest Alerts</span>
              <span>Harvest Planning</span>
              <span>Market Intelligence</span>
            </div>
          </div>
        </section>
      </div>

      {showAddModal && (
        <div
          className="crop-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowAddModal(false);
            }
          }}
        >
          <div className="crop-modal">
            <div className="modal-header">
              <div>
                <p className="section-kicker">
                  NEW CROP
                </p>

                <h2>Add Crop</h2>

                <p>
                  Add basic information about your crop.
                </p>
              </div>

              <button
                type="button"
                className="modal-close-button"
                onClick={() =>
                  setShowAddModal(false)
                }
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddCrop}>
              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="crop-name">
                    Crop name *
                  </label>

                  <input
                    id="crop-name"
                    type="text"
                    placeholder="e.g. Tomato"
                    value={form.name}
                    onChange={(event) =>
                      updateForm(
                        "name",
                        event.target.value
                      )
                    }
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="crop-variety">
                    Variety
                  </label>

                  <input
                    id="crop-variety"
                    type="text"
                    placeholder="e.g. Arka Rakshak"
                    value={form.variety}
                    onChange={(event) =>
                      updateForm(
                        "variety",
                        event.target.value
                      )
                    }
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="crop-field">
                    Field / Location
                  </label>

                  <input
                    id="crop-field"
                    type="text"
                    placeholder="e.g. North Field"
                    value={form.field}
                    onChange={(event) =>
                      updateForm(
                        "field",
                        event.target.value
                      )
                    }
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="crop-area">
                    Area (acres)
                  </label>

                  <input
                    id="crop-area"
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="e.g. 2.5"
                    value={form.area}
                    onChange={(event) =>
                      updateForm(
                        "area",
                        event.target.value
                      )
                    }
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="planting-date">
                    Planting date
                  </label>

                  <input
                    id="planting-date"
                    type="date"
                    value={form.plantingDate}
                    onChange={(event) =>
                      updateForm(
                        "plantingDate",
                        event.target.value
                      )
                    }
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="harvest-date">
                    Expected harvest
                  </label>

                  <input
                    id="harvest-date"
                    type="date"
                    value={form.harvestDate}
                    onChange={(event) =>
                      updateForm(
                        "harvestDate",
                        event.target.value
                      )
                    }
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="growth-stage">
                    Growth stage
                  </label>

                  <select
                    id="growth-stage"
                    value={form.growthStage}
                    onChange={(event) =>
                      updateForm(
                        "growthStage",
                        event.target.value
                      )
                    }
                  >
                    {growthStages.map((stage) => (
                      <option
                        key={stage}
                        value={stage}
                      >
                        {stage}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label htmlFor="irrigation">
                    Irrigation
                  </label>

                  <select
                    id="irrigation"
                    value={form.irrigation}
                    onChange={(event) =>
                      updateForm(
                        "irrigation",
                        event.target.value
                      )
                    }
                  >
                    {irrigationTypes.map((type) => (
                      <option
                        key={type}
                        value={type}
                      >
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-modal-button"
                  onClick={() =>
                    setShowAddModal(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-crop-button"
                >
                  <Plus size={17} />
                  Add Crop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedCrop && (
        <div
          className="crop-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedCrop(null);
            }
          }}
        >
          <div className="crop-modal details-modal">
            <div className="modal-header">
              <div>
                <p className="section-kicker">
                  CROP DETAILS
                </p>

                <h2>{selectedCrop.name}</h2>

                {selectedCrop.variety && (
                  <p>
                    {selectedCrop.variety}
                  </p>
                )}
              </div>

              <button
                type="button"
                className="modal-close-button"
                onClick={() =>
                  setSelectedCrop(null)
                }
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="details-content">
              <div className="detail-box">
                <span>Field</span>

                <strong>
                  {selectedCrop.field ||
                    "Not specified"}
                </strong>
              </div>

              <div className="detail-box">
                <span>Area</span>

                <strong>
                  {selectedCrop.area
                    ? `${selectedCrop.area} acres`
                    : "Not specified"}
                </strong>
              </div>

              <div className="detail-box">
                <span>Growth Stage</span>

                <strong>
                  {selectedCrop.growthStage}
                </strong>
              </div>

              <div className="detail-box">
                <span>Irrigation</span>

                <strong>
                  {selectedCrop.irrigation}
                </strong>
              </div>

              <div className="detail-box">
                <span>Planting Date</span>

                <strong>
                  {formatDate(
                    selectedCrop.plantingDate
                  )}
                </strong>
              </div>

              <div className="detail-box">
                <span>Expected Harvest</span>

                <strong>
                  {formatDate(
                    selectedCrop.harvestDate
                  )}
                </strong>
              </div>
            </div>

            <div className="details-note">
              <Sprout size={18} />

              <p>
                These crop details help Fasal AI understand
                your farm context for weather, irrigation,
                disease monitoring and harvest planning.
              </p>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="secondary-modal-button danger-button"
                onClick={() =>
                  handleDeleteCrop(
                    selectedCrop.id
                  )
                }
              >
                <Trash2 size={16} />
                Delete Crop
              </button>

              <button
                type="button"
                className="primary-crop-button"
                onClick={() =>
                  setSelectedCrop(null)
                }
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}