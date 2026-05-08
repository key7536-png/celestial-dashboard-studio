import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2, Save, Package } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/products")({
  head: () => ({ meta: [{ title: "상품 관리 — 자개빛" }] }),
  component: ProductsPage,
});

type DeliveryType = "consultation" | "pdf" | "ebook";
type Category = "saju" | "tarot" | "pdf" | "ebook" | "etc";

interface ShopProduct {
  id: string;
  user_id: string;
  name: string;
  category: Category;
  delivery_type: DeliveryType;
  price: number;
  sale_price: number | null;
  description: string | null;
  duration: string | null;
  file_url: string | null;
  icon: string | null;
  is_active: boolean;
  sort_order: number;
}

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "saju", label: "🔮 사주" },
  { value: "tarot", label: "🃏 타로" },
  { value: "pdf", label: "📄 PDF" },
  { value: "ebook", label: "📥 전자책" },
  { value: "etc", label: "✨ 기타" },
];

const DELIVERY: { value: DeliveryType; label: string }[] = [
  { value: "consultation", label: "상담 (24h 답변)" },
  { value: "pdf", label: "PDF (제작 후 발송)" },
  { value: "ebook", label: "전자책 (즉시 다운로드)" },
];

const PRESETS: Omit<ShopProduct, "id" | "user_id" | "sort_order">[] = [
  { name: "사주 1질문 상담", category: "saju", delivery_type: "consultation", price: 10000, sale_price: 5000, description: "생년월일로 궁금한 것 1가지를 물어보세요", duration: "24시간 이내 답변", file_url: null, icon: "🔮", is_active: true },
  { name: "사주 30분 상담권", category: "saju", delivery_type: "consultation", price: 19000, sale_price: null, description: "심층 사주 분석 + 궁금한 것 모두", duration: "예약 후 진행", file_url: null, icon: "🔮", is_active: true },
  { name: "타로 1질문 리딩", category: "tarot", delivery_type: "consultation", price: 10000, sale_price: 5000, description: "타로 카드 3장으로 질문 1가지 리딩", duration: "24시간 이내 답변", file_url: null, icon: "🃏", is_active: true },
  { name: "타로 채팅 상담 30분", category: "tarot", delivery_type: "consultation", price: 19000, sale_price: null, description: "실시간 채팅으로 깊이 있는 타로 상담", duration: "예약 후 진행", file_url: null, icon: "🃏", is_active: true },
  { name: "VIP 종합 상담 60분", category: "etc", delivery_type: "consultation", price: 39000, sale_price: null, description: "사주 + 타로 통합 분석", duration: "예약 후 진행", file_url: null, icon: "✨", is_active: true },
  { name: "PDF 미니 운세 리포트", category: "pdf", delivery_type: "pdf", price: 9900, sale_price: null, description: "나만의 운세 분석 30장 PDF", duration: "즉시 제작 후 발송", file_url: null, icon: "📄", is_active: true },
  { name: "PDF 스탠다드 운세 리포트", category: "pdf", delivery_type: "pdf", price: 15000, sale_price: null, description: "상세 운세 분석 50장 PDF", duration: "24시간 이내 발송", file_url: null, icon: "📄", is_active: true },
  { name: "PDF 프리미엄 운세 리포트", category: "pdf", delivery_type: "pdf", price: 25000, sale_price: null, description: "종합 운세 + 12개월 흐름 100장 PDF", duration: "24시간 이내 발송", file_url: null, icon: "📄", is_active: true },
  { name: "2026 삼재 가이드 PDF", category: "ebook", delivery_type: "ebook", price: 15000, sale_price: null, description: "삼재를 이기는 실전 가이드", duration: "즉시 다운로드", file_url: null, icon: "📥", is_active: true },
];

function ProductsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<ShopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  async function reload() {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("shop_products")
      .select("*")
      .eq("user_id", user.id)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) toast.error(error.message);
    setItems((data as ShopProduct[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { void reload(); /* eslint-disable-next-line */ }, [user]);

  async function addBlank() {
    if (!user) return;
    const { data, error } = await supabase
      .from("shop_products")
      .insert({
        user_id: user.id,
        name: "새 상품",
        category: "tarot",
        delivery_type: "consultation",
        price: 10000,
        is_active: true,
        sort_order: items.length,
      })
      .select()
      .single();
    if (error) return toast.error(error.message);
    setItems((p) => [...p, data as ShopProduct]);
  }

  async function loadPresets() {
    if (!user) return;
    if (items.length > 0 && !confirm("기존 상품 외에 9개 기본 상품을 추가할까요?")) return;
    const rows = PRESETS.map((p, i) => ({ ...p, user_id: user.id, sort_order: items.length + i }));
    const { error } = await supabase.from("shop_products").insert(rows);
    if (error) return toast.error(error.message);
    toast.success("기본 9개 상품을 불러왔어요");
    await reload();
  }

  function patch(id: string, p: Partial<ShopProduct>) {
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, ...p } : x)));
  }

  async function save(item: ShopProduct) {
    setSavingId(item.id);
    const { error } = await supabase
      .from("shop_products")
      .update({
        name: item.name,
        category: item.category,
        delivery_type: item.delivery_type,
        price: Number(item.price) || 0,
        sale_price: item.sale_price ? Number(item.sale_price) : null,
        description: item.description,
        duration: item.duration,
        file_url: item.file_url,
        icon: item.icon,
        is_active: item.is_active,
      })
      .eq("id", item.id);
    setSavingId(null);
    if (error) return toast.error(error.message);
    toast.success("저장됨");
  }

  async function remove(id: string) {
    if (!confirm("삭제할까요?")) return;
    const { error } = await supabase.from("shop_products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setItems((p) => p.filter((x) => x.id !== id));
  }

  return (
    <PageShell icon={Package} title="상품 관리" description="고객 상점(/shop)에 노출될 상품을 관리합니다">
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="text-sm text-muted-foreground">
            총 {items.length}개 · 활성 {items.filter((x) => x.is_active).length}개
          </div>
          <div className="flex gap-2">
            {items.length === 0 && (
              <Button variant="outline" onClick={loadPresets}>
                기본 9개 상품 불러오기
              </Button>
            )}
            <Button onClick={addBlank} className="bg-gradient-to-r from-primary to-pink-500">
              <Plus className="h-4 w-4 mr-1" /> 상품 추가
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : items.length === 0 ? (
          <Card className="p-12 text-center bg-card/40 border-dashed">
            <p className="text-muted-foreground mb-4">아직 등록된 상품이 없어요.</p>
            <p className="text-xs text-muted-foreground">"기본 9개 상품 불러오기"로 시작하거나 직접 추가하세요.</p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {items.map((p) => (
              <Card key={p.id} className="p-5 bg-card/60 border-border/50 space-y-3">
                <div className="flex items-start gap-3">
                  <Input
                    className="w-16 text-center text-2xl"
                    value={p.icon ?? ""}
                    onChange={(e) => patch(p.id, { icon: e.target.value })}
                    placeholder="🃏"
                  />
                  <Input
                    className="flex-1 font-semibold"
                    value={p.name}
                    onChange={(e) => patch(p.id, { name: e.target.value })}
                    placeholder="상품명"
                  />
                  <div className="flex items-center gap-2">
                    <Switch checked={p.is_active} onCheckedChange={(v) => patch(p.id, { is_active: v })} />
                    <span className="text-xs text-muted-foreground w-8">{p.is_active ? "활성" : "숨김"}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <Label className="text-xs">카테고리</Label>
                    <Select value={p.category} onValueChange={(v) => patch(p.id, { category: v as Category })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">전달 방식</Label>
                    <Select value={p.delivery_type} onValueChange={(v) => patch(p.id, { delivery_type: v as DeliveryType })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {DELIVERY.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">정가 (원)</Label>
                    <Input type="number" value={p.price} onChange={(e) => patch(p.id, { price: Number(e.target.value) })} />
                  </div>
                  <div>
                    <Label className="text-xs">할인가 (선택)</Label>
                    <Input type="number" value={p.sale_price ?? ""} onChange={(e) => patch(p.id, { sale_price: e.target.value ? Number(e.target.value) : null })} />
                  </div>
                </div>

                <div>
                  <Label className="text-xs">한줄 설명</Label>
                  <Textarea
                    rows={2}
                    value={p.description ?? ""}
                    onChange={(e) => patch(p.id, { description: e.target.value })}
                    placeholder="고객 카드에 표시될 설명"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">소요시간/분량</Label>
                    <Input
                      value={p.duration ?? ""}
                      onChange={(e) => patch(p.id, { duration: e.target.value })}
                      placeholder="예: 24시간 이내 답변"
                    />
                  </div>
                  {p.delivery_type === "ebook" && (
                    <div>
                      <Label className="text-xs">다운로드 파일 URL</Label>
                      <Input
                        value={p.file_url ?? ""}
                        onChange={(e) => patch(p.id, { file_url: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-border/40">
                  <Button variant="ghost" size="sm" onClick={() => remove(p.id)} className="text-rose-400 hover:text-rose-300">
                    <Trash2 className="h-3.5 w-3.5 mr-1" /> 삭제
                  </Button>
                  <Button size="sm" onClick={() => save(p)} disabled={savingId === p.id}>
                    {savingId === p.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><Save className="h-3.5 w-3.5 mr-1" /> 저장</>}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
