import { createFileRoute } from "@tanstack/react-router";
import { ChatScaffold } from "@/components/chat-scaffold";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/chat/saju")({
  head: () => ({ meta: [{ title: "개인 사주 채팅 — 자개빛" }] }),
  component: SajuChat,
});

const TIME_SLOTS = [
  "모름","자시 (23:30~01:30)","축시 (01:30~03:30)","인시 (03:30~05:30)","묘시 (05:30~07:30)",
  "진시 (07:30~09:30)","사시 (09:30~11:30)","오시 (11:30~13:30)","미시 (13:30~15:30)",
  "신시 (15:30~17:30)","유시 (17:30~19:30)","술시 (19:30~21:30)","해시 (21:30~23:30)",
];

interface Form {
  name: string; birth: string; calendar: string; gender: string; time: string; question: string;
}

function SajuChat() {
  return (
    <ChatScaffold<Form>
      chatType="saju"
      aiMode="saju-personal"
      title="개인 사주 채팅 상담"
      subtitle="한 명의 사주로 1:1 카톡 답변을 만들어드려요"
      submitLabel="🔮 사주 답변 생성"
      initialForm={{ name: "", birth: "", calendar: "양력", gender: "여성", time: "모름", question: "" }}
      validate={(f) => (!f.name || !f.birth || !f.question.trim()) ? "이름·생년월일·질문을 입력해주세요." : null}
      buildPayload={(f) => ({ name: f.name, birth: f.birth, calendar: f.calendar, gender: f.gender, time: f.time, question: f.question })}
      clientName={(f) => f.name}
      renderForm={(f, set) => (
        <>
          <Field label="내담자 이름"><Input value={f.name} onChange={(e) => set({ name: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="생년월일"><Input type="date" value={f.birth} onChange={(e) => set({ birth: e.target.value })} /></Field>
            <Field label="달력">
              <RadioGroup value={f.calendar} onValueChange={(v) => set({ calendar: v })} className="flex gap-3 pt-2">
                {["양력","음력"].map((v) => (
                  <label key={v} className="flex items-center gap-1.5 text-sm"><RadioGroupItem value={v} />{v}</label>
                ))}
              </RadioGroup>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="성별">
              <RadioGroup value={f.gender} onValueChange={(v) => set({ gender: v })} className="flex gap-3 pt-2">
                {["여성","남성"].map((v) => (
                  <label key={v} className="flex items-center gap-1.5 text-sm"><RadioGroupItem value={v} />{v}</label>
                ))}
              </RadioGroup>
            </Field>
            <Field label="태어난 시간">
              <Select value={f.time} onValueChange={(v) => set({ time: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TIME_SLOTS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
          </div>
          <Field label="질문">
            <Textarea
              value={f.question}
              onChange={(e) => set({ question: e.target.value })}
              placeholder="예: 올해 재물운, 이직 시기, 연애운"
              className="min-h-[90px]"
            />
          </Field>
        </>
      )}
    />
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-xs">{label}</Label>{children}</div>;
}
