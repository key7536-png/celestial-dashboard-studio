// Compact 78-card tarot deck (English names + Korean labels)
const major = [
  "The Fool / 바보","The Magician / 마법사","The High Priestess / 여사제","The Empress / 여황제",
  "The Emperor / 황제","The Hierophant / 교황","The Lovers / 연인","The Chariot / 전차",
  "Strength / 힘","The Hermit / 은둔자","Wheel of Fortune / 운명의 수레바퀴","Justice / 정의",
  "The Hanged Man / 매달린 남자","Death / 죽음","Temperance / 절제","The Devil / 악마",
  "The Tower / 탑","The Star / 별","The Moon / 달","The Sun / 태양",
  "Judgement / 심판","The World / 세계",
];
const suits = ["Cups / 컵","Pentacles / 펜타클","Swords / 소드","Wands / 완드"];
const ranks = ["Ace","2","3","4","5","6","7","8","9","10","Page","Knight","Queen","King"];
const minor = suits.flatMap(s => ranks.map(r => `${r} of ${s}`));
export const TAROT_DECK = [...major, ...minor];

export interface DrawnCard { name: string; reversed: boolean }

export function drawCards(count: number): DrawnCard[] {
  const shuffled = [...TAROT_DECK].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map(name => ({ name, reversed: Math.random() < 0.3 }));
}
