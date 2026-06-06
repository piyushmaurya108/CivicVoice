const mongoose = require('mongoose');

// Sub-schema for a single ranked portal suggestion (Change 4)
const PortalSuggestionSchema = new mongoose.Schema(
  {
    name: String,
    url: String,
    officer: String,
    email: String,
    phone: String,
    description: String,
    steps: [String],
    isMunicipal: Boolean,
    isNational: Boolean,
    tag: String // e.g. "Recommended", "Alternative", "National fallback"
  },
  { _id: false }
);

const ComplaintSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['broken_road', 'waterlogging', 'garbage', 'streetlight', 'sewage', 'water_supply', 'other'],
      required: true
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: true
    },
    // Change 2: description is now the mandatory basis for every complaint (min 20 chars).
    description: { type: String, required: true, minlength: 20, maxlength: 500 },
    aiDescription: { type: String },

    // Change 2: photo is now optional — imageUrl may be absent.
    imageUrl: { type: String },
    imagePublicId: { type: String },

    // GeoJSON Point — coordinates are [longitude, latitude]
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator: (v) =>
            Array.isArray(v) &&
            v.length === 2 &&
            v[0] >= -180 &&
            v[0] <= 180 &&
            v[1] >= -90 &&
            v[1] <= 90,
          message: 'Coordinates must be [lng, lat] within valid range'
        }
      }
    },

    address: {
      ward: String,
      locality: String,
      city: String,
      district: String,
      state: String,
      pincode: String,
      areaType: String, // 'city' | 'town' | 'village' | null  (Change 4 routing)
      fullAddress: String
    },

    // Top-ranked portal (kept for backward compatibility with existing UI/data)
    matchedPortal: {
      name: String,
      url: String,
      officer: String,
      email: String,
      phone: String,
      description: String,
      steps: [String],
      isMunicipal: Boolean,
      isNational: Boolean
    },

    // Change 4: full ranked list of relevant portals
    portalSuggestions: { type: [PortalSuggestionSchema], default: [] },

    clusterId: String,
    nearbyCount: { type: Number, default: 1 },

    petitionText: String,

    landmark: String,
    aiConfidence: Number
  },
  { timestamps: true }
);

// Geospatial + lookup indexes (status index removed in Change 1)
ComplaintSchema.index({ location: '2dsphere' });
ComplaintSchema.index({ type: 1, createdAt: -1 });
ComplaintSchema.index({ 'address.state': 1, 'address.district': 1 });

module.exports = mongoose.model('Complaint', ComplaintSchema);
