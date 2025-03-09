import Image from 'next/image';
import Link from 'next/link';

const page: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* ヘッダーセクション */}
      <header className="relative w-full h-screen">
        {/* 背景画像 */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hawai.jpg"
            alt="ハワイの風景"
            fill
            className="object-cover brightness-75"
            priority
          />
        </div>
        
        {/* ヘッダーコンテンツ */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">旅のしおり</h1>
          <p className="text-xl md:text-2xl mb-10 text-center max-w-2xl">
            思い出に残る旅行を、もっと簡単に。もっと楽しく。
          </p>
          <Link href="/create-group" className="bg-white text-blue-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-blue-50 transition-colors shadow-lg">
            はじめる
          </Link>
        </div>
      </header>

      {/* アプリ紹介セクション */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">旅の計画を手軽に始められるアプリ</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <Image
                src="/images/smartphone.png"
                alt="アプリの使用イメージ"
                width={600}
                height={400}
              />
            </div>
            <div>
              <p className="text-lg text-gray-700 mb-6">
                「旅のしおり」は、旅行の計画から実行までをサポートする完全無料のアプリです。
                友達や家族との旅行計画を簡単に共有・編集でき、思い出に残る旅の準備をスムーズに進めることができます。
              </p>
              <p className="text-lg text-gray-700">
                旅行前の悩みや準備の手間を減らし、大切な人との素敵な思い出づくりに集中できるよう、私たちがサポートします。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 機能紹介セクション */}
      <section className="py-24 px-4 bg-blue-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">主な機能</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* 機能1 */}
            <div className="bg-white rounded-xl shadow-md">
              <div className="h-48 relative">
                <Image
                  src="/images/shiori.png"
                  alt="しおり作成機能"
                  fill
                  className="object-cover rounded-t-lg"
                />
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-4">しおり作成機能</h3>
                <p className="text-gray-700">
                  行きたい場所、宿泊先、交通手段など、旅のプランを簡単に整理。
                  日程ごとに詳細なスケジュールを組むことができます。
                  </p>
              </div>
            </div>
            
            {/* 機能2 */}
            <div className="bg-white rounded-xl shadow-md">
              <div className="h-48 relative">
                <Image
                  src="/images/LINE.png"
                  alt="共有機能"
                  fill
                  className="object-cover rounded-t-lg"
                />
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-4">共有機能（LINE共有）</h3>
                <p className="text-gray-700">
                  作成したしおりをLINEで簡単に共有。
                  友達や家族と旅の計画を共有して、みんなで楽しく旅行の準備ができます。
                </p>
              </div>
            </div>
            
            {/* 機能3 */}
            <div className="bg-white rounded-xl shadow-md">
              <div className="h-48 relative">
                <Image
                  src="/images/mochimono.jpeg"
                  alt="持ち物チェック"
                  fill
                  className="object-cover rounded-t-lg"
                />
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-4">持ち物チェック</h3>
                <p className="text-gray-700">
                  旅行に必要な持ち物リストを簡単に作成。
                  チェックリスト形式で管理でき、忘れ物を防止します。
                </p>
              </div>
            </div>
            
            {/* 機能4 */}
            <div className="bg-white rounded-xl shadow-md">
              <div className="h-48 relative">
                <Image
                  src="/images/group.png"
                  alt="グループ共同編集"
                  fill
                  className="object-cover rounded-t-lg"
                />
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-4">グループで共同編集</h3>
                <p className="text-gray-700">
                  複数人で同時に旅のプランを編集可能。
                  みんなのアイデアを取り入れた、より楽しい旅行プランを作成できます。
                </p>
              </div>
            </div>
            
            {/* 機能5 */}
            <div className="bg-white rounded-xl shadow-md">
              <div className="h-48 relative">
                <Image
                  src="/images/notify.png"
                  alt="通知機能"
                  fill
                  className="object-cover rounded-t-lg"
                />
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-4">通知機能</h3>
                <p className="text-gray-700">
                  旅行の日程が近づくとお知らせ。
                  また、グループメンバーの編集内容も通知で確認できるので、常に最新情報を把握できます。
                  </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTAセクション */}
      <section className="py-24 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">あなたの旅を、もっと特別に</h2>
          <p className="text-xl mb-10">
            今すぐ「旅のしおり」で、次の冒険を計画しましょう。
            簡単な操作で、忘れられない思い出づくりをサポートします。
          </p>
          <Link href="/create-group" className="bg-white text-blue-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-blue-50 transition-colors shadow-lg inline-block">
            無料ではじめる
          </Link>
        </div>
      </section>

      {/* フッター */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h2 className="text-2xl font-bold">旅のしおり</h2>
              <p className="text-gray-400 mt-2">あなたの旅をもっと楽しく、もっと便利に</p>
            </div>
            <div className="flex space-x-4">
              <Link href="/terms" className="text-gray-400 hover:text-white">
                利用規約
              </Link>
              <Link href="/privacy" className="text-gray-400 hover:text-white">
                プライバシーポリシー
              </Link>
              <Link href="/contact" className="text-gray-400 hover:text-white">
                お問い合わせ
              </Link>
            </div>
          </div>
          <div className="mt-8 text-center text-gray-500">
            <p>© {new Date().getFullYear()} 旅のしおり All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default page;