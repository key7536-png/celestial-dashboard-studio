import { createFileRoute } from "@tanstack/react-router";
import { ChatScaffold } from "@/components/chat-scaffold";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export const Route = createFileRoute("/chat/couple")({
  head: () => ({ meta: [{ title: "궁합 채팅 — 자개빛" }] }),
  component: CoupleChat,
});

interface Form {
  myName: string; myBirth: string; myCalendar: string; myGender: string;
  partnerName: string; partnerBirth: string; partnerCalendar: string; partnerGender: string;
  matchType: string;
}

function CoupleChat() {
  return (
    <ChatScaffold<Form>
      chatType="couple"
      aiMode="saju-couple"
      title="궁합 채팅 상담"
      subtitle="두 사람 생년월일을 넣으면 궁합 답변을 만들어드려요. 카톡에 그대로 복붙하세요"
      submitLabel="💑 궁합 답변 생성"
      initialForm={{
        myName: "", myBirth: "", myCalendar: "양력", myGender: "여성",
        partnerName: "", partnerBirth: "", partnerCalendar: "양력", partnerGender: "남성",
        matchType: "연애 궁합",
      }}
      validate={(f) => (!f.myName || !f.myBirth || !f.partnerName || !f.partnerBirth) ? "두 사람 정보를 모두 입력해주세요." : null}
      buildPayload={(f) => ({
        myName: f.myName, myBirth: `${f.myBirth} (${f.myCalendar}/${f.myGender})`,
        partnerName: f.partnerName, partnerBirth: `${f.partnerBirth} (${f.partnerCalendar}/${f.partnerGender})`,
        question: f.matchType,
      })}
      clientName={(f) => `${f.myName} ❤ ${f.partnerName}`}
      renderForm={(f, set) => (
        <>
          <PersonBlock title="나 (의뢰인)"
            name={f.myName} birth={f.myBirth} calendar={f.myCalendar} gender={f.myGender}
            onChange={(p) => set({ myName: p.name, myBirth: p.birth, myCalendar: p.calendar, myGender: p.gender } as Partial<Form>)}
          />
          <PersonBlock title="상대방"
            name={f.partnerName} birth={f.partnerBirth} calendar={f.partnerCalendar} gender={f.partnerGender}
            onChange={(p) => set({ partnerName: p.name, partnerBirth: p.birth, partnerCalendar: p.calendar, partnerGender: p.gender } as Partial<Form>)}
          />
          <div className="space-y-1.5">
            <Label className="text-xs">궁합 유형</Label>
            <div className="flex gap-2 flex-wrap">
              {["연애 궁합","결혼 궁합","직장/사업 궁합"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => set({ matchType: t })}
                  className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                    f.matchType === t
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:border-primary/50"
                  }`}
                >{t}</button>
              ))}
            </div>
          </div>
        </>
      )}
    />
  );
}

function PersonBlock({ title, name, birth, calendar, gender, onChange }: {
  title: string; name: string; birth: string; calendar: string; gender: string;
  onChange: (p: { name: string; birth: string; calendar: string; gender: string }) => void;
}) {
  return (
    <div className="space-y-3 rounded-lg border border-border/50 p-3">
      <p className="text-xs text-muted-foreground font-semibold">{title}</p>
      <Input placeholder="이름" value={name} onChange={(e) => onChange({ name: e.target.value, birth, calendar, gender })} />
      <Input type="date" value={birth} onChange={(e) => onChange({ name, birth: e.target.value, calendar, gender })} />
      <div className="grid grid-cols-2 gap-2">
        <RadioGroup value={calendar} onValueChange={(v) => onChange({ name, birth, calendar: v, gender })} className="flex gap-3">
          {["양력","음력"].map((v) => (
            <label key={v} className="flex items-center gap-1.5 text-xs"><RadioGroupItem value={v} />{v}</label>
          ))}
        </RadioGroup>
        <RadioGroup value={gender} onValueChange={(v) => onChange({ name, birth, calendar, gender: v })} className="flex gap-3">
          {["여성","남성"].map((v) => (
            <label key={v} className="flex items-center gap-1.5 text-xs"><RadioGroupItem value={v} />{v}</label>
          ))}
        </RadioGroup>
      </div>
    </div>
  );
}
