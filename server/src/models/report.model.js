import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    report_id: { type: String, required: true, unique: true },
    source_device: {
      device_id: String,
      imei: String,
      serial_number: String,
      os: String,
      os_version: String,
      extraction_tool: String,
      extraction_type: { type: String, enum: ["logical", "physical", "file_system"] },
      extracted_at: { type: Date, default: Date.now },
    },

    user_profile: {
      name: String,
      aliases: [String],
      phones: [String],
      emails: [String],
      addresses: [String],
      cloud_accounts: [String],
      social_handles: [String],
    },

    contacts: [
      {
        contact_id: String,
        name: String,
        phones: [String],
        emails: [String],
        relation: String,
        groups: [String],
      },
    ],
    messages: [
      {
        message_id: String,
        platform: String,
        sender: String,
        receiver: String,
        timestamp: Date,
        content: String,
        attachments: [String],
        deleted: { type: Boolean, default: false },
      },
    ],

    calls: [
      {
        call_id: String,
        caller: String,
        callee: String,
        duration: Number,
        call_type: {
          type: String,
          enum: ["incoming", "outgoing", "missed", "voip_video", "conference"],
        },
        timestamp: Date,
        deleted: { type: Boolean, default: false },
      },
    ],

    media: [
      {
        media_id: String,
        type: { type: String, enum: ["image", "video", "audio", "document"] },
        file_path: String, // local path or cloud
        hash: String, // md5/sha256
        metadata: Object, // EXIF, GPS, device info
        timestamp: Date,
        deleted: { type: Boolean, default: false },
      },
    ],

    locations: [
      {
        location_id: String,
        source: { type: String, enum: ["gps", "cell_tower", "wifi", "app"] },
        latitude: Number,
        longitude: Number,
        accuracy: Number,
        timestamp: Date,
      },
    ],

    transactions: [
      {
        txn_id: String,
        from_user: String,
        to_user: String,
        wallet_address: String,
        amount: Number,
        currency: String,
        timestamp: Date,
      },
    ],

    browserHistory: [
      {
        history_id: String,
        browser: String,
        url: String,
        title: String,
        timestamp: Date,
      },
    ],

    apps: [
      {
        app_id: String,
        name: String,
        version: String,
        last_opened: Date,
        type: { type: String, enum: ["system", "social", "messaging", "finance", "other"] },
        usage_stats: Object,
      },
    ],

    crypto: [Object],

    security: {
      lock_type: String,
      jailbroken: Boolean,
      encryption_enabled: Boolean,
      certificates: [String],
      system_logs: [String],
    },

    deletedData: [
      {
        data_type: String,
        original_id: String,
        recovery_status: String,
        timestamp: Date,
      },
    ],

    documents: [Object],

    analytics: {
      most_active_contacts: [String],
      communication_frequency: Object, // {contact_id: count}
      group_memberships: Object, // {group_name: [contact_ids]}
      suspicious_activity_flags: [String],
    },

    synced_to_neo4j: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Report", reportSchema);
