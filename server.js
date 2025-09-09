import express from "express";
const app = express();
app.use(express.json());

function getToolCallId(body) {
  return body?.toolCallId
      || body?.message?.toolCallList?.[0]?.id
      || body?.tool?.id
      || body?.id;
}

function ok(res, id, result={ok:true}) {
  res.json({ results: [ { toolCallId: id, result } ] });
}

app.post("/check_dnd", (req,res)=> {
  const id = getToolCallId(req.body);
  ok(res, id, {dnd:false,opt_out:false});
});

app.post("/create_or_update_lead", (req,res)=> {
  const id = getToolCallId(req.body);
  ok(res, id, {lead_id:"L-"+Date.now()});
});

app.post("/schedule_callback", (req,res)=> {
  const id = getToolCallId(req.body);
  ok(res, id, {meeting_id:"M-"+Date.now()});
});

app.post("/send_message", (req,res)=> {
  const id = getToolCallId(req.body);
  ok(res, id, {});
});

app.post("/transfer_to_human", (req,res)=> {
  const id = getToolCallId(req.body);
  ok(res, id, {queued:"wealth"});
});

app.post("/log_call_event", (req,res)=> {
  const id = getToolCallId(req.body);
  ok(res, id, {});
});

app.listen(process.env.PORT || 3000, ()=> console.log("Webhook running"));