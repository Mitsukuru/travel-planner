'use client';

import Link from 'next/link';
import { useState } from 'react';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const categories = [
    { value: '', label: 'カテゴリを選択してください' },
    { value: 'bug', label: 'バグ報告' },
    { value: 'feature', label: '機能要望' },
    { value: 'usage', label: '使い方について' },
    { value: 'account', label: 'アカウントについて' },
    { value: 'other', label: 'その他' }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // 実際の送信処理をここに実装
    // 今回はデモ用として2秒後に成功とする
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        category: '',
        subject: '',
        message: ''
      });
    }, 2000);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">送信完了</h2>
            <p className="text-gray-600 mb-6">
              お問い合わせありがとうございます。<br/>
              内容を確認の上、3営業日以内にご返信いたします。
            </p>
            <div className="space-y-3">
              <button
                onClick={() => setSubmitted(false)}
                className="w-full bg-emerald-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
              >
                新しいお問い合わせ
              </button>
              <Link
                href="/"
                className="block w-full text-gray-600 py-3 px-6 rounded-lg border hover:bg-gray-50 transition-colors"
              >
                トップページに戻る
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-transparent bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text">
              旅のしおり
            </Link>
            <Link href="/" className="text-gray-600 hover:text-gray-800 transition-colors">
              ← トップに戻る
            </Link>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-xl shadow-sm p-8 md:p-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">お問い合わせ</h1>
            <p className="text-xl text-gray-600">
              ご質問やご要望がございましたら、お気軽にお問い合わせください
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* お問い合わせ情報 */}
            <div className="lg:col-span-1">
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">よくあるご質問</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <h4 className="font-medium text-gray-700">Q. 無料で利用できますか？</h4>
                      <p className="text-gray-600">A. はい、すべての機能を無料でご利用いただけます。</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700">Q. データの同期はどのように行われますか？</h4>
                      <p className="text-gray-600">A. リアルタイムで自動同期されます。</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700">Q. オフラインでも利用できますか？</h4>
                      <p className="text-gray-600">A. 一部機能はオフラインでもご利用いただけます。</p>
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">お急ぎの場合</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    緊急のお問い合わせの場合は、お問い合わせの際に「緊急」と件名に記載してください。
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>返信目安：</strong><br/>
                    通常のお問い合わせ：3営業日以内<br/>
                    緊急のお問い合わせ：24時間以内
                  </p>
                </div>
              </div>
            </div>

            {/* お問い合わせフォーム */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      お名前 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                      placeholder="山田太郎"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      メールアドレス <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                      placeholder="example@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    お問い合わせカテゴリ <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                  >
                    {categories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    件名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                    placeholder="お問い合わせの件名を入力してください"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    お問い合わせ内容 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors resize-vertical"
                    placeholder="お問い合わせ内容を詳しくご記入ください..."
                  />
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">個人情報の取り扱いについて</h4>
                  <p className="text-sm text-blue-700">
                    お預かりした個人情報は、
                    <Link href="/privacy" className="underline hover:text-blue-800">
                      プライバシーポリシー
                    </Link>
                    に基づき適切に管理し、お問い合わせへの回答以外の目的では使用いたしません。
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-emerald-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        送信中...
                      </>
                    ) : (
                      '送信する'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ name: '', email: '', category: '', subject: '', message: '' })}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    クリア
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* フッター */}
      <footer className="bg-gray-900 text-white py-8 px-4 mt-16">
        <div className="max-w-4xl mx-auto text-center">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            旅のしおり
          </Link>
          <p className="text-gray-400 mt-2">© {new Date().getFullYear()} 旅のしおり All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default ContactPage;