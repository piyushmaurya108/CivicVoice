const mongoose = require('mongoose');

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
    description: { type: String, maxlength: 500 },
    aiDescription: { type: String },

    imageUrl: { type: String, required: true },
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
      fullAddress: String
    },

    matchedPortal: {
      name: String,
      url: String,
      officer: String,
      email: String,
      phone: String,
      steps: [String],
      isMunicipal: Boolean,
      isNational: Boolean
    },

    clusterId: String,
    nearbyCount: { type: Number, default: 1 },

    petitionText: String,

    status: {
      type: String,
      enum: ['pending', 'under_review', 'resolved'],
      default: 'pending'
    },

    reporterSession: String,
    landmark: String,
    aiConfidence: Number
  },
  { timestamps: true }
);

// Geospatial + lookup indexes
ComplaintSchema.index({ location: '2dsphere' });
ComplaintSchema.index({ type: 1, createdAt: -1 });
ComplaintSchema.index({ 'address.state': 1, 'address.district': 1 });
ComplaintSchema.index({ status: 1 });

module.exports = mongoose.model('Complaint', ComplaintSchema);
