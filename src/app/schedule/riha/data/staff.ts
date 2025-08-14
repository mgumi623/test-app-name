export const TEAMS = ['2A', '2B', '3A', '3B', '4A', '4B'] as const;

export const POSITION_PRIORITY: Record<string, number> = {
  '主任': 3,
  '副主任': 2,
  '一般': 1,
};

const getRandomYears = (position: string) => {
  if (position === '主任') return Math.floor(Math.random() * 5) + 10; // 10-15年
  if (position === '副主任') return Math.floor(Math.random() * 5) + 7; // 7-12年
  return Math.floor(Math.random() * 7) + 1; // 1-7年
};

export const PROFESSIONS = ['PT', 'OT', 'ST', 'DH'] as const;

export const PROFESSION_PRIORITY: Record<string, number> = {
  'PT': 4,
  'OT': 3,
  'ST': 2,
  'DH': 1,
};

export interface Staff {
  id: string;
  name: string;
  team: string;
  position: string;
  profession: string;
  years: number;
}

// 初期スタッフリストを生成
const initialStaff = Array.from({ length: 100 }, (_, i) => ({
  id: `staff-${i + 1}`,
  name: [
    '山田', '鈴木', '佐藤', '田中', '伊藤', '渡辺', '山本', '中村', '小林', '加藤',
    '吉田', '松本', '井上', '木村', '林', '斎藤', '清水', '山口', '森', '阿部',
  ][Math.floor(Math.random() * 20)] + [
    '一郎', '二郎', '三郎', '太郎', '次郎', '花子', '美咲', '裕子', '智子', '和子',
    '直樹', '健一', '優子', '美穂', '真由', '健太', '恵子', '幸子', '美香', '隆',
  ][Math.floor(Math.random() * 20)],
  team: TEAMS[Math.floor(Math.random() * TEAMS.length)],
  position: '一般',
  profession: (() => {
    const rand = Math.random() * 100;
    if (rand < 60) return 'PT';
    if (rand < 80) return 'OT';
    if (rand < 90) return 'ST';
    return 'DH';
  })(),
  years: 1
}));

// 主任と副主任を各チームに割り当てる
export const STAFF = (() => {
  // チームごとのスタッフをグループ化
  const staffByTeam = TEAMS.reduce((acc, team) => {
    acc[team] = initialStaff.filter(staff => staff.team === team);
    return acc;
  }, {} as Record<string, Staff[]>);

  // 各チームからランダムに1人選んで主任に設定
  TEAMS.forEach(team => {
    const teamStaff = staffByTeam[team];
    if (teamStaff.length > 0) {
      // 主任を設定
      const chiefIndex = Math.floor(Math.random() * teamStaff.length);
      const chiefStaff = teamStaff[chiefIndex];
      chiefStaff.position = '主任';
      chiefStaff.years = getRandomYears('主任');

      // 残りのスタッフから副主任を設定
      const remainingStaff = teamStaff.filter((_, index) => index !== chiefIndex);
      if (remainingStaff.length > 0) {
        const subChiefIndex = Math.floor(Math.random() * remainingStaff.length);
        const subChiefStaff = remainingStaff[subChiefIndex];
        subChiefStaff.position = '副主任';
        subChiefStaff.years = getRandomYears('副主任');
      }
    }
  });

  // 全スタッフの経験年数を役職に応じて設定
  return initialStaff.map(staff => ({
    ...staff,
    years: staff.position === '一般' ? getRandomYears(staff.position) : staff.years
  }));
})();