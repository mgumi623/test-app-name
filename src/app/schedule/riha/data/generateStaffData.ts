import { Staff } from './staff';

const FAMILY_NAMES = [
  '山田', '鈴木', '佐藤', '田中', '伊藤', '渡辺', '山本', '中村', '小林', '加藤',
  '吉田', '松本', '井上', '木村', '林', '斎藤', '清水', '山口', '森', '阿部',
  '池田', '橋本', '山下', '石川', '中島', '前田', '藤田', '後藤', '近藤', '村上',
  '遠藤', '青木', '坂本', '斉藤', '福田', '太田', '西村', '藤井', '岡田', '三浦'
];

const GIVEN_NAMES = [
  '翔太', '陽菜', '大輝', '美咲', '悠斗', '凛', '悠真', '結衣', '悠斗', '葵',
  '颯太', '美羽', '大和', '優奈', '蒼空', '心愛', '陽翔', '結菜', '樹', '莉子',
  '健一', '美咲', '達也', '奈々', '隆', '桃子', '直樹', '愛美', '智也', '由美',
  '剛', '恵子', '誠', '裕子', '豊', '京子', '学', '香織', '洋平', '友美'
];

// チーム情報はTeamsContextから取得するため、ここでは一時的なデータを使用
const DEFAULT_TEAMS = ['2A', '2B', '3A', '3B', '4A', '4B'];

function generateRandomName(): string {
  const familyName = FAMILY_NAMES[Math.floor(Math.random() * FAMILY_NAMES.length)];
  const givenName = GIVEN_NAMES[Math.floor(Math.random() * GIVEN_NAMES.length)];
  return `${familyName} ${givenName}`;
}

function getRandomYears(position: string): number {
  switch (position) {
    case '主任':
      return Math.floor(Math.random() * 6) + 10; // 10-15年
    case '副主任':
      return Math.floor(Math.random() * 4) + 7;  // 7-10年
    default:
      return Math.floor(Math.random() * 5) + 1;  // 1-5年
  }
}

function generateProfession(): string {
  const rand = Math.random() * 100;
  if (rand < 60) return 'PT';
  if (rand < 80) return 'OT';
  if (rand < 90) return 'ST';
  return 'DH';
}

export function generateStaffData(teams?: { id: string, name: string }[]): Staff[] {
  const teamsToUse = teams?.map(t => t.name) || DEFAULT_TEAMS;
  const staffPerTeam = Math.floor(100 / teamsToUse.length); // 各チーム約16-17人
  const staffList: Staff[] = [];
  let staffId = 1;

  teamsToUse.forEach(team => {
    // 主任を1人追加
    staffList.push({
      id: `staff-${staffId++}`,
      name: generateRandomName(),
      team,
      position: '主任',
      profession: generateProfession(),
      years: getRandomYears('主任')
    });

    // 副主任を1人追加
    staffList.push({
      id: `staff-${staffId++}`,
      name: generateRandomName(),
      team,
      position: '副主任',
      profession: generateProfession(),
      years: getRandomYears('副主任')
    });

    // 残りのスタッフを追加
    for (let i = 0; i < staffPerTeam - 2; i++) {
      staffList.push({
        id: `staff-${staffId++}`,
        name: generateRandomName(),
        team,
        position: '一般',
        profession: generateProfession(),
        years: getRandomYears('一般')
      });
    }
  });

  // 100人になるまで調整
  while (staffList.length < 100) {
    const randomTeam = teamsToUse[Math.floor(Math.random() * teamsToUse.length)];
    staffList.push({
      id: `staff-${staffId++}`,
      name: generateRandomName(),
      team: randomTeam,
      position: '一般',
      profession: generateProfession(),
      years: getRandomYears('一般')
    });
  }

  return staffList;
}