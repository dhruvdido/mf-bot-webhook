import express from "express";
const app = express();
app.use(express.json({ limit: "1mb" }));

function getToolCallId(body) {
  return body?.toolCallId
      || body?.id
      || body?.tool?.id
      || body?.message?.toolCallList?.[0]?.id
      || body?.message?.tool_calls?.[0]?.id
      || "unknown";
}
function ok(res, id, result = { ok: true }) {
  res.json({ results: [ { toolCallId: id, result } ] });
}

// Health
app.get("/", (_,res) => res.send("OK"));
app.get("/healthz", (_,res) => res.json({ ok:true }));

// Tools
app.post("/check_dnd", (req,res)=> {
  const id = getToolCallId(req.body);
  ok(res, id, { ok:true, dnd:false, opt_out:false });
});
app.post("/create_or_update_lead", (req,res)=>{
  const id = getToolCallId(req.body);
  const a = req.body?.arguments || {};
  ok(res, id, { ok:true, lead_id: "L-"+Date.now(), saved: a });
});
app.post("/schedule_callback", (req,res)=>{
  const id = getToolCallId(req.body);
  const { slot_iso } = req.body?.arguments || {};
  ok(res, id, { ok:true, meeting_id: "M-"+Date.now(), slot_iso });
});
app.post("/send_message", (req,res)=>{
  const id = getToolCallId(req.body);
  const { channel, message } = req.body?.arguments || {};
  ok(res, id, { ok:true, sent_via: channel, text_preview: (message||"").slice(0,160) });
});
app.post("/transfer_to_human", (req,res)=> {
  const id = getToolCallId(req.body);
  ok(res, id, { ok:true, queued:"wealth" });
});
const events = [];
app.post("/log_call_event",(req,res)=>{
  const id = getToolCallId(req.body);
  const evt = { ts: new Date().toISOString(), ...(req.body?.arguments||{}) };
  events.push(evt);
  ok(res, id, { ok:true, total_events: events.length });
});
app.get("/admin/events", (_,res)=> res.json(events)); // audit

// Error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({ error: "internal_error" });
});

app.listen(process.env.PORT || 3000, ()=> console.log("Webhook running"));
