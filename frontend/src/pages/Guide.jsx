import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useTranslation } from '../contexts/LanguageContext';

const GUIDE_CONTENT = {
  vi: {
    title: "Hướng dẫn sử dụng",
    subtitle: "Tài liệu hướng dẫn đăng ký, quản lý tài khoản và giao thương trên Voma.",
    sections: {
      intro: {
        title: "Giới thiệu chung",
        text: "Chào mừng doanh nghiệp của bạn tham gia vào mạng lưới BizHub Voma - nền tảng kết nối giao thương, chia sẻ cơ hội hợp tác kinh tế và ứng dụng Trợ lý AI chuyên sâu cho doanh nghiệp.",
        img_label: "Ảnh demo toàn bộ trang chủ web"
      },
      register: {
        title: "1. Đăng ký & Phê duyệt",
        step1_title: "Bước 1: Kê khai thông tin doanh nghiệp",
        step1_text: "Chọn 'Gia nhập ngay'. Nhập thông tin chi tiết về doanh nghiệp:\n- Tên doanh nghiệp: Tên chính thức trên giấy phép đăng ký kinh doanh.\n- Lĩnh vực hoạt động: Bạn có thể click chọn từ danh sách gợi ý hoặc nhập tự do lĩnh vực đặc thù của mình.\n- Tỉnh/Thành phố trụ sở: Hỗ trợ bộ gõ tìm kiếm nhanh hoặc tự điền tự do 63 tỉnh thành Việt Nam.\n- Quy mô (Nhân sự), Mã số thuế, Địa chỉ chi tiết, Mã bưu điện (ZIP), và Mô tả ngắn hoạt động kinh doanh.\nNhấn 'Tiếp tục'.",
        step2_title: "Bước 2: Thông tin người đại diện",
        step2_text: "Cung cấp Họ và tên, Chức vụ, Email liên hệ và Số điện thoại di động của người đại diện.\nNhấn 'Tiếp tục'.",
        step3_title: "Bước 3: Thiết lập tài khoản đăng nhập",
        step3_text: "Nhập Tên đăng nhập (Username) và Mật khẩu bảo mật (tối thiểu 8 ký tự).\nNhấn 'Đăng ký tài khoản'.",
        step4_title: "Bước 4: Chờ Ban quản trị phê duyệt hồ sơ",
        step4_text: "Sau khi gửi đăng ký, tài khoản của bạn sẽ ở trạng thái Chờ duyệt (Pending).\nLưu ý: Trong thời gian chờ duyệt hoặc nếu bị Admin từ chối, bạn sẽ không thể đăng nhập. Trình đăng nhập sẽ hiển thị thông báo trạng thái rõ ràng."
      },
      dashboard: {
        title: "2. Dashboard Hội viên",
        text: "Khi tài khoản của bạn đã được duyệt, bạn đăng nhập để truy cập trang Dashboard Hội viên.",
        sub1_title: "Quản lý thông tin hồ sơ",
        sub1_text: "Xem và chỉnh sửa các thông tin cơ bản của doanh nghiệp bất cứ lúc nào tại thẻ Thông tin doanh nghiệp.\nNhấn Cập nhật thông tin để lưu thay đổi.",
        sub2_title: "Theo dõi phân hạng & Yêu cầu nâng cấp gói hội viên",
        sub2_text: "Hệ thống BizHub chia hội viên thành 3 cấp độ:\n1. Silver (Mặc định): Miễn phí, được sử dụng chatbot AI mặc định, đăng tin kết nối cơ bản.\n2. Gold: Trả phí, được mở thêm nhiều quyền lợi, hiển thị thứ hạng cao hơn trong thư mục.\n3. Platinum: Quyền lợi cao cấp nhất, được ghim tin nổi bật lên trang chủ, ghim đối tác nổi bật, và sử dụng toàn bộ mô hình AI mới nhất.\n\n- Thời hạn sử dụng: Hạn sử dụng gói của bạn sẽ hiển thị trực tiếp bên cạnh huy hiệu phân hạng. Khi hết hạn, tài khoản của bạn sẽ tự động hạ về gói Silver.\n- Yêu cầu nâng cấp: Gửi yêu cầu nâng cấp gói trực tiếp từ Dashboard. Admin sẽ duyệt và kích hoạt thời hạn cho bạn."
      },
      post: {
        title: "3. Đăng tin giao thương",
        text: "Doanh nghiệp của bạn có thể đăng các tin bài tuyển dụng, cung cấp sản phẩm hoặc tìm kiếm đối tác hợp tác phát triển.",
        sub1_title: "Soạn thảo tin đăng chuyên nghiệp (Rich Text Editor)",
        sub1_text: "Trình soạn thảo tích hợp các công cụ chuyên nghiệp để viết bài báo:\n- Định dạng Tiêu đề lớn (Heading), In đậm (Bold), In nghiêng (Italic), Gạch chân, Gạch ngang.\n- Điều chỉnh Kích thước chữ (từ nhỏ đến khổng lồ) và Màu sắc chữ (sử dụng bảng màu trực quan).\n- Chèn liên kết link và hình ảnh minh họa bài viết.\n\nLưu bản nháp: Bạn có thể lưu lại bản nháp để chỉnh sửa sau hoặc gửi đăng trực tiếp để chờ Admin phê duyệt.",
        sub2_title: "Quyền lợi ghim nổi bật (Dành riêng cho Platinum)",
        sub2_text: "Nếu doanh nghiệp của bạn sở hữu gói Platinum, khi viết bài bạn sẽ thấy một ô chọn: \"Yêu cầu Ban quản trị ghim nổi bật bài đăng này ngoài trang chủ\".\nĐánh dấu chọn ô này sẽ gửi tín hiệu ưu tiên ghim nổi bật tới Admin để xét duyệt đưa bài viết của bạn lên vị trí nổi bật trang chủ (Tối đa 3 bài viết nổi bật toàn trang)."
      },
      ai: {
        title: "4. Trợ lý AI chuyên nghiệp",
        text: "Truy cập mục Khám phá trợ lý AI trên thanh Header để sử dụng công cụ AI thông minh.",
        sub1_title: "Trò chuyện & Phân tích thông tin thông minh",
        sub1_text: "- Trả lời thông tin được lấy từ dữ liệu của trang web trực quan, chuyên nghiệp, giúp kết nối với các doanh nghiệp thực tế.\n\nThay đổi mô hình AI (Gói Gold & Platinum):\n- Nếu là thành viên Gold hoặc Platinum, bạn có thể click vào biểu tượng cài đặt phía góc trên khung chat để thay đổi mô hình trả lời.\n- Các dòng mô hình hỗ trợ bao gồm: OpenAI GPT-4o, DeepSeek V3, DeepSeek R1, Claude 4 Opus, Gemini 3 Flash giúp trả lời sâu sắc và chính xác các câu hỏi kinh tế phức tạp."
      },
      connect: {
        title: "5. Kết nối & Xem đối tác",
        text: "BizHub Voma cung cấp các giải pháp kết nối trực tiếp hiệu quả giữa các doanh nghiệp thành viên.",
        sub1_title: "Bảng tin cơ hội & Thư mục hội viên & Sự kiện",
        sub1_text: "- Bảng tin: Xem toàn bộ cơ hội giao thương từ các doanh nghiệp khác. Bài viết chi tiết sẽ hiển thị full màn hình chuyên nghiệp. Để bảo vệ thông tin, khách vãng lai (chưa đăng nhập) sẽ bị ẩn thông tin liên hệ và cần đăng nhập để mở khóa liên kết email/số điện thoại trực tiếp.\n- Thư mục hội viên: Danh sách đối tác được xếp hạng ưu tiên (Platinum trước, sau đó đến Gold và Silver). Bạn có thể tìm kiếm, lọc theo hạng, ngành nghề và số lượng hiển thị trên trang để kết nối giao thương nhanh nhất.\n- Sự kiện: Danh sách các sự kiện được tổ chức bởi các doanh nghiệp, hỗ trợ theo dõi mức độ quan tâm và địa điểm diễn ra."
      }
    }
  },
  en: {
    title: "User Guide",
    subtitle: "Guide document for registration, account management and trading features on Voma.",
    sections: {
      intro: {
        title: "General Introduction",
        text: "Welcome to Voma BizHub - the business connection platform, sharing economic cooperation opportunities and applying professional AI Assistants.",
        img_label: "Website Homepage Overview"
      },
      register: {
        title: "1. Register & Approve",
        step1_title: "Step 1: Declare Business Details",
        step1_text: "Click 'Join Now'. Enter detailed business info:\n- Company Name: Official business license name.\n- Industry: Select a recommendation or type custom entries.\n- Headquarters City: Search-as-you-type autocomplete supporting 63 cities.\n- Staff Scale, Tax Code, Address, ZIP code, and brief business description.\nClick 'Next'.",
        step2_title: "Step 2: Legal Representative Info",
        step2_text: "Provide Full Name, Title, Contact Email, and Mobile Phone of the representative.\nClick 'Next'.",
        step3_title: "Step 3: Setup Login Account",
        step3_text: "Enter Login Username and secure Password (minimum 8 characters).\nClick 'Register Account'.",
        step4_title: "Step 4: Await Admin Approval",
        step4_text: "After registering, your account status is set to 'Pending'.\nNote: You cannot log in during pending review or if rejected. Status indicators will display on the login page."
      },
      dashboard: {
        title: "2. Member Dashboard",
        text: "Once approved, log in to access the Business Member Dashboard.",
        sub1_title: "Manage Profile Information",
        sub1_text: "View and edit your company info anytime under the 'Company Info' tab and click 'Update Profile' to save changes.",
        sub2_title: "Subscription Tracking & Upgrades",
        sub2_text: "BizHub splits members into 3 tiers:\n1. Silver (Default): Free tier, standard AI chatbot access, basic matching posts.\n2. Gold: Paid tier, higher listing placement in the directory, unlocks extra privileges.\n3. Platinum: Premium tier, featured home page pinning, VIP partner pinning, access to advanced AI models.\n\n- Expiration dates display next to the tier badges. When expired, accounts automatically downgrade to Silver.\n- Upgrade requests can be sent directly from the dashboard for Admin review and activation."
      },
      post: {
        title: "3. Trade Opportunities",
        text: "Publish recruitment feeds, product supplies, or investment search items.",
        sub1_title: "Professional Writing (Rich Text Editor)",
        sub1_text: "Use WYSIWYG editing features:\n- Font Styles: Headings, Bold, Italic, Underline, Strikethrough.\n- Custom Options: customized Font Sizes and Colors.\n- Multimedia: embed hyperlinks and images.\n\nSave Drafts: Save posts as drafts to edit later, or submit directly for approval.",
        sub2_title: "Featured Home Pinning (Platinum Exclusively)",
        sub2_text: "Platinum accounts get a featured home pinning request checkbox: \"Request Admin to pin this post on the home page\".\nToggling this alerts Admins to pin your opportunity post on the home page (up to 3 featured homepage spots)."
      },
      ai: {
        title: "4. Business AI Assistant",
        text: "Click 'AI Assistant' in the header menu to start a smart AI consultation session.",
        sub1_title: "Q&A and Market Analysis",
        sub1_text: "- AI responses leverage database matching to offer real-time answers from site data.\n\nAI Model Swapping (Gold & Platinum):\n- Premium members can tap the settings gear in the chat area to switch models.\n- Supported models include: OpenAI GPT-4o, DeepSeek V3, DeepSeek R1, Claude 4 Opus, and Gemini 3 Flash."
      },
      connect: {
        title: "5. Connecting & Directory",
        text: "Voma BizHub offers direct matching features to help member companies connect.",
        sub1_title: "Opportunity Feed, Directory & Events",
        sub1_text: "- Opportunity Feed: Read B2B posts from other members. Fullscreen detail view. Unauthenticated guests must log in to unlock emails and phone numbers.\n- Member Directory: Prioritized ranking by subscription tier (Platinum -> Gold -> Silver). Apply name, industry, and city search filters.\n- Events: Lists business matchmaking conferences and forums with event interest trackers."
      }
    }
  },
  zh: {
    title: "使用指南",
    subtitle: "关于在 Voma 平台注册、管理账户和发布商机的指南文档。",
    sections: {
      intro: {
        title: "平台介绍",
        text: "欢迎您的企业加入 Voma 商业对接 network — 这是一个致力于促进 B2B 贸易、共享合作商机并应用专业级 AI 助手的企业服务平台。",
        img_label: "网站首页预览"
      },
      register: {
        title: "1. 注册与审批",
        step1_title: "第一步：填报企业基本信息",
        step1_text: "点击'立即加入'。输入企业的详细信息：\n- 企业名称：营业执照上的官方名称。\n- 行业领域：可选推荐行业或自由输入特别领域。\n- 总部城市：支持63省市快速检索联想输入。\n- 人员规模、税号、详细地址、邮政编码（ZIP）和简要业务介绍。\n点击'继续'。",
        step2_title: "第二步：填写法定代表人信息",
        step2_text: "提供法代表人的姓名、职务、联系邮箱和手机号码。\n点击'继续'。",
        step3_title: "第三步：设置登录账号",
        step3_text: "输入登录用户名和密码（至少8个字符）。\n点击'注册账号'。",
        step4_title: "第四步：等待管理员审核",
        step4_text: "提交注册后，您的账号处于'待审核'（Pending）状态。\n注意：在审核期间或被拒绝后，您将无法登录，登录窗口会明确显示审核状态。"
      },
      dashboard: {
        title: "2. 会员控制台",
        text: "账号通过审核后，登录即可访问企业控制台（Dashboard）。",
        sub1_title: "管理企业信息",
        sub1_text: "在'企业信息'选项卡下随时查看和编辑您的企业详情，点击'更新信息'以保存更改。",
        sub2_title: "会员等级跟踪与升级",
        sub2_text: "系统将会员分为 3 个级别：\n1. 银牌（默认）：免费，使用基础 AI 助手，发布标准商机信息。\n2. 金牌：付费，在名录中享有更高排序，解锁更多专属权益。\n3. 白金牌：至尊特权，支持首页置顶、推荐合作，以及使用最新的先进 AI 模型。\n\n- 会员有效期显示在等级勋章旁。过期后账号自动降级为银牌。\n- 您可以直接从控制台提交升级请求以供管理员审批和激活。"
      },
      post: {
        title: "3. 商机与对接",
        text: "企业可以发布招聘、产品供应、合作采购及项目招商等对接信息。",
        sub1_title: "专业富文本编辑器 (Rich Text Editor)",
        sub1_text: "编辑器集成了专业的文字排版功能：\n- 格式：大标题（Heading）、加粗、斜体、下划线、删除线。\n- 自定义：调整字体大小和颜色。\n- 多媒体：插入超链接和文章插图。\n\n保存草稿：您可以将其保存为草稿以供日后修改，或直接提交以待管理员审批。",
        sub2_title: "首页置顶权益（白金牌专属）",
        sub2_text: "白金牌会员在发布商机时可勾选'申请管理员将该条信息在首页置顶显示'。\n勾选后将向管理员发送置顶申请，审批通过后可展示在首页推荐位（全站最多同时置顶 3 篇）。"
      },
      ai: {
        title: "4. 专业 AI 助手",
        text: "点击导航栏的'AI 助手'以启动智能 AI 顾问咨询。",
        sub1_title: "问答与业务分析",
        sub1_text: "- AI 助手基于平台数据库进行智能解答，直观地呈现结果，助力商业匹配。\n\n切换 AI 模型（金牌与白金牌）：\n- 高级会员可点击聊天窗口右上角的设置齿轮来更换底座模型。\n- 支持的模型包括：OpenAI GPT-4o, DeepSeek V3, DeepSeek R1, Claude 4 Opus 以及 Gemini 3 Flash。"
      },
      connect: {
        title: "5. 对接与名录",
        text: "Voma 平台为企业会员提供高效的直连对接渠道。",
        sub1_title: "商机看板、会员名录及活动",
        sub1_text: "- 商机看板：查看其他企业发布的 B2B 合作信息，点击支持全屏详情页。游客状态下联系人姓名和电话将被隐藏，需登录以解锁。\n- 会员名录：根据等级排序（白金牌 -> 金牌 -> 银牌），支持按行业、城市等关键字进行筛选匹配。\n- 活动看板：展示即将举办的商务会议与对接论坛，支持关注并查看线下地址。"
      }
    }
  },
  ja: {
    title: "ご利用ガイド",
    subtitle: "Vomaにおける新規登録、アカウント管理、およびマッチング機能の解説マニュアル。",
    sections: {
      intro: {
        title: "はじめに",
        text: "Vomaビズハブへようこそ。当プラットフォームは、企業間のビジネスマッチング、提携機会の共有、および業務特化型AIアシスタントの活用を支援するWebシステムです。",
        img_label: "ホームページ全体の概要"
      },
      register: {
        title: "1. 登録と承認",
        step1_title: "ステップ1: 企業情報の入力",
        step1_text: "「今すぐ参加」をクリックします。企業名、業界分野（推奨から選択または自由入力）、本社所在地（63省市から検索入力）、従業員規模、税務コード、詳細住所、郵便番号（ZIP）、および事業内容の概要を入力し、「次へ」をクリックします。",
        step2_title: "ステップ2: 代表者情報の入力",
        step2_text: "法的な代表者の氏名、役職、連絡先メールアドレス、および携帯電話番号を入力し、「次へ」をクリックします。",
        step3_title: "ステップ3: ログインアカウントの設定",
        step3_text: "ログイン用ユーザー名とセキュアなパスワード（8文字以上）を入力し、「アカウント作成」をクリックします。",
        step4_title: "ステップ4: 管理者による承認待ち",
        step4_text: "登録完了後、アカウントは「承認待ち（Pending）」になります。\n注意：審査中または却下された場合はログインできません。ログイン画面に明確な審査ステータスが表示されます。"
      },
      dashboard: {
        title: "2. 会員ダッシュボード",
        text: "アカウントが承認された後、ログインすると会員ダッシュボードにアクセスできます。",
        sub1_title: "登録プロファイルの管理",
        sub1_text: "「企業情報」タブからいつでも登録した情報を確認・編集できます。「情報を更新」をクリックして変更を保存します。",
        sub2_title: "ランク追跡とアップグレード申請",
        sub2_text: "メンバーは次の 3 つのランクに分かれています：\n1. シルバー（デフォルト）：無料、基本AIチャットの使用、標準案件の投稿が可能。\n2. ゴールド：有料、名録の上位に優先表示され、追加特典が解放。\n3. プラチナ：最上位特典、ホームページへの案件ピン留め、VIP紹介、およびすべての最新AIモデルが利用可能。\n\n- 有効期限はランクバッジの隣に表示されます。期限が切れると自動的にシルバーに降格します。\n- ダッシュボードからアップグレードを申請し、管理者が承認と有効化を行います。"
      },
      post: {
        title: "3. 案件の投稿と共有",
        text: "求人、製品供給、または共同投資의募集案件を投稿できます。",
        sub1_title: "高機能エディタによる編集 (Rich Text Editor)",
        sub1_text: "高機能エディタが標準装備されており：\n- 書式設定：大見出しの設定、太字、斜体、下線、打ち消し線の適用。\n- カスタム：フォントサイズと文字色の調整。\n- メディア：リンクと画像の挿入が可能です。\n\n下書き保存：下書きとして保存するか、審査に直接提出できます。",
        sub2_title: "ホームおすすめ枠へのピン留め（プラチナ限定）",
        sub2_text: "プラチナ会員は案件作成時に「この投稿をホームページのおすすめ枠にピン留めするよう申請する」チェックボックスが表示されます。有効にすると管理者にピン留め申請が送られ、承認後に表示されます（全サイト最大3件まで）。"
      },
      ai: {
        title: "4. 高度な AI アシスタント",
        text: "ヘッダーの「AIアシスタント」をクリックして、スマートAIコンサルテーションを開始します。",
        sub1_title: "Q&Aとデータ分析",
        sub1_text: "- AIアシスタントはプラットフォームのデータベースと連動し、実在する企業との接続を容易にします。\n\nAIモデルの切り替え（ゴールド＆プラチナ）：\n- プレミアム会員はチャット画面右上の設定ギアからモデルを変更可能です。\n- 利用可能モデル：OpenAI GPT-4o, DeepSeek V3, DeepSeek R1, Claude 4 Opus, Gemini 3 Flash。"
      },
      connect: {
        title: "5. パートナー探索",
        text: "Vomaは、会員企業間の効率的でダイレクトなコネクションを提供します。",
        sub1_title: "案件フィード、会員名録、およびイベント",
        sub1_text: "- 案件フィード：他社が投稿したB2B案件の詳細を全画面表示で確認できます。ゲスト状態では連絡先名と電話番号が非表示となり、ログインすることでロックが解除されます。\n- 会員名録：ランク順（プラチナ -> ゴールド -> シルバー）に優先表示され、業界、都市、キーワードで検索可能です。\n- イベント：近日開催予定の商談会やフォーラムを一覧表示し、イベントへの参加意向を表明できます。"
      }
    }
  }
};

const SECTIONS = [
  { id: 'intro', icon: 'ti ti-help' },
  { id: 'register', icon: 'ti ti-user-plus' },
  { id: 'dashboard', icon: 'ti ti-layout-dashboard' },
  { id: 'post', icon: 'ti ti-file-text' },
  { id: 'ai', icon: 'ti ti-robot' },
  { id: 'connect', icon: 'ti ti-users' }
];

export const Guide = () => {
  const { currentLang, t } = useTranslation();
  const [activeTab, setActiveTab] = useState('intro');
  const [selectedImg, setSelectedImg] = useState(null);

  const langContent = GUIDE_CONTENT[currentLang] || GUIDE_CONTENT.vi;

  const handleOpenImg = (src) => {
    setSelectedImg(src);
  };

  const renderContent = () => {
    const s = langContent.sections;
    switch (activeTab) {
      case 'intro':
        return (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', marginBottom: '1.25rem', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="ti ti-help" style={{ color: 'var(--primary)' }}></i> {s.intro.title}
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '2rem' }}>
              {s.intro.text}
            </p>
            <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '12px', fontWeight: 600 }}>
                {s.intro.img_label} (Click to expand)
              </span>
              <img 
                src="/img_guide/img_full.png" 
                alt="Homepage" 
                style={{ width: '100%', maxWidth: '650px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'zoom-in', transition: 'transform 0.2s' }}
                onClick={() => handleOpenImg('/img_guide/img_full.png')}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.01)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              />
            </div>
          </div>
        );
      case 'register':
        return (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', marginBottom: '1.25rem', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="ti ti-user-plus" style={{ color: 'var(--primary)' }}></i> {s.register.title}
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--amber)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <i className="ti ti-circle-number-1"></i> {s.register.step1_title}
                </h3>
                <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.7', whiteSpace: 'pre-line', margin: 0 }}>
                  {s.register.step1_text}
                </p>
                <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
                  <img 
                    src="/img_guide/image%201.png" 
                    alt="Step 1" 
                    style={{ width: '100%', maxWidth: '600px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', cursor: 'zoom-in' }}
                    onClick={() => handleOpenImg('/img_guide/image 1.png')}
                  />
                </div>
              </div>

              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--amber)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <i className="ti ti-circle-number-2"></i> {s.register.step2_title}
                </h3>
                <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.7', whiteSpace: 'pre-line', margin: 0 }}>
                  {s.register.step2_text}
                </p>
                <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
                  <img 
                    src="/img_guide/image%202.png" 
                    alt="Step 2" 
                    style={{ width: '100%', maxWidth: '600px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', cursor: 'zoom-in' }}
                    onClick={() => handleOpenImg('/img_guide/image 2.png')}
                  />
                </div>
              </div>

              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--amber)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <i className="ti ti-circle-number-3"></i> {s.register.step3_title}
                </h3>
                <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.7', whiteSpace: 'pre-line', margin: 0 }}>
                  {s.register.step3_text}
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--amber)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <i className="ti ti-circle-number-4"></i> {s.register.step4_title}
                </h3>
                <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.7', whiteSpace: 'pre-line', margin: 0 }}>
                  {s.register.step4_text}
                </p>
              </div>
            </div>
          </div>
        );
      case 'dashboard':
        return (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', marginBottom: '1.25rem', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="ti ti-layout-dashboard" style={{ color: 'var(--primary)' }}></i> {s.dashboard.title}
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '2rem' }}>
              {s.dashboard.text}
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--amber)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <i className="ti ti-edit"></i> {s.dashboard.sub1_title}
                </h3>
                <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.7', whiteSpace: 'pre-line', margin: 0 }}>
                  {s.dashboard.sub1_text}
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--amber)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <i className="ti ti-star"></i> {s.dashboard.sub2_title}
                </h3>
                <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.7', whiteSpace: 'pre-line', margin: 0 }}>
                  {s.dashboard.sub2_text}
                </p>
                <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
                  <img 
                    src="/img_guide/image%203.png" 
                    alt="Dashboard" 
                    style={{ width: '100%', maxWidth: '600px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', cursor: 'zoom-in' }}
                    onClick={() => handleOpenImg('/img_guide/image 3.png')}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      case 'post':
        return (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', marginBottom: '1.25rem', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="ti ti-file-text" style={{ color: 'var(--primary)' }}></i> {s.post.title}
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '2rem' }}>
              {s.post.text}
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--amber)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <i className="ti ti-pencil"></i> {s.post.sub1_title}
                </h3>
                <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.7', whiteSpace: 'pre-line', margin: 0 }}>
                  {s.post.sub1_text}
                </p>
                <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
                  <img 
                    src="/img_guide/image%204.png" 
                    alt="Editor" 
                    style={{ width: '100%', maxWidth: '600px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', cursor: 'zoom-in' }}
                    onClick={() => handleOpenImg('/img_guide/image 4.png')}
                  />
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--amber)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <i className="ti ti-circle-check"></i> {s.post.sub2_title}
                </h3>
                <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.7', whiteSpace: 'pre-line', margin: 0 }}>
                  {s.post.sub2_text}
                </p>
              </div>
            </div>
          </div>
        );
      case 'ai':
        return (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', marginBottom: '1.25rem', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="ti ti-robot" style={{ color: 'var(--primary)' }}></i> {s.ai.title}
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '2rem' }}>
              {s.ai.text}
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div>
                <h3 style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--amber)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <i className="ti ti-messages"></i> {s.ai.sub1_title}
                </h3>
                <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.7', whiteSpace: 'pre-line', margin: 0 }}>
                  {s.ai.sub1_text}
                </p>
                <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
                  <img 
                    src="/img_guide/image%205.png" 
                    alt="AI Models" 
                    style={{ width: '100%', maxWidth: '600px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', cursor: 'zoom-in' }}
                    onClick={() => handleOpenImg('/img_guide/image 5.png')}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      case 'connect':
        return (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', marginBottom: '1.25rem', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="ti ti-users" style={{ color: 'var(--primary)' }}></i> {s.connect.title}
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '2rem' }}>
              {s.connect.text}
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
              <div>
                <h3 style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--amber)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <i className="ti ti-network"></i> {s.connect.sub1_title}
                </h3>
                <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.7', whiteSpace: 'pre-line', marginBottom: '1.5rem' }}>
                  {s.connect.sub1_text}
                </p>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '10px', fontWeight: 600 }}>Bảng tin bài đăng</span>
                    <img 
                      src="/img_guide/image%206.png" 
                      alt="Feeds" 
                      style={{ width: '100%', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', cursor: 'zoom-in' }}
                      onClick={() => handleOpenImg('/img_guide/image 6.png')}
                    />
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '10px', fontWeight: 600 }}>Thư mục hội viên</span>
                    <img 
                      src="/img_guide/image%207.png" 
                      alt="Directory" 
                      style={{ width: '100%', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', cursor: 'zoom-in' }}
                      onClick={() => handleOpenImg('/img_guide/image 7.png')}
                    />
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '10px', fontWeight: 600 }}>Sự kiện</span>
                    <img 
                      src="/img_guide/image%208.png" 
                      alt="Events" 
                      style={{ width: '100%', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', cursor: 'zoom-in' }}
                      onClick={() => handleOpenImg('/img_guide/image 8.png')}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="public-body">
      <Navbar />

      {/* Background gradient decorative elements */}
      <div style={{ position: 'fixed', top: '-10%', left: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(79,70,229,0.04) 0%, rgba(79,70,229,0) 70%)', zIndex: -1, pointerEvents: 'none', borderRadius: '50%' }}></div>
      <div style={{ position: 'fixed', bottom: '-10%', right: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(245,158,11,0.02) 0%, rgba(245,158,11,0) 70%)', zIndex: -1, pointerEvents: 'none', borderRadius: '50%' }}></div>

      <div className="public-container" style={{ minHeight: '85vh', paddingBottom: '4rem', paddingTop: '2.5rem' }}>
        {/* Header Title */}
        <div style={{ textAlign: 'left', marginBottom: '2.5rem' }}>
          <h1 style={{ fontFamily: 'var(--font-title)', fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
            <i className="ti ti-help" style={{ color: 'var(--primary)' }}></i> {langContent.title}
          </h1>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '6px', marginBlockEnd: 0 }}>
            {langContent.subtitle}
          </p>
        </div>

        {/* Documentation Portal Layout */}
        <div className="shell-doc" style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          {/* Left Sidebar (Navigation Tabs) */}
          <div className="glass-card" style={{ width: '100%', maxWidth: '280px', minWidth: '220px', padding: '1rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(8,14,30,0.6)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {SECTIONS.map((sec) => {
                const isActive = activeTab === sec.id;
                const secTitle = langContent.sections[sec.id].title;
                return (
                  <button
                    key={sec.id}
                    onClick={() => setActiveTab(sec.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      width: '100%',
                      padding: '12px 14px',
                      background: isActive ? 'var(--primary-glow)' : 'transparent',
                      border: 'none',
                      borderRadius: '10px',
                      color: isActive ? '#fff' : 'var(--text-secondary)',
                      fontFamily: 'var(--font-title)',
                      fontSize: '13.5px',
                      fontWeight: isActive ? 600 : 550,
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      borderLeft: isActive ? '3px solid var(--primary-light)' : '3px solid transparent'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <i className={sec.icon} style={{ fontSize: '15px', color: isActive ? 'var(--primary-light)' : 'var(--text-muted)' }}></i>
                    <span>{secTitle}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Main Content Panel */}
          <div className="glass-card" style={{ flex: 1, minWidth: '320px', padding: '2.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(8,14,30,0.4)', minHeight: '400px' }}>
            {renderContent()}
          </div>
        </div>
      </div>

      <Footer />

      {/* Screenshot Lightbox Modal overlay */}
      {selectedImg && (
        <div 
          onClick={() => setSelectedImg(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(5, 8, 18, 0.9)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            cursor: 'zoom-out',
            animation: 'fadeIn 0.2s ease'
          }}
        >
          <img 
            src={selectedImg} 
            alt="Guide screenshot expanded view" 
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.15)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
              objectFit: 'contain'
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Guide;
