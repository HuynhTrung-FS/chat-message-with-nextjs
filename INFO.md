## Cách cài đặt Customs Snippsets: (trong trường hợp này là react ts function component)

Step 1: Click the following into your Settings; User Snippets; create (if not exists) and not create (if exists)typescriptreact.json
Step 2: Paste content from https://pastebin.com/PWzQGH08 to file typescriptreact.json
Step 3: Type "fc" and hit TAB.

## sử dụng UpStash làm database

- step 1: tiến hành login bằng google
- step 2: create database (ở chỗ chọn vùng các bạn có thể chọn bất cứ vùng nào cũng được)
- Tiến hành kéo xuống lấy 2 giá trị UPSTASH_REDIS_REST_URL và UPSTASH_REDIS_REST_TOKEN

- Tham khảo doc: https://docs.upstash.com/redis

## NextJS hỗ trợ dynamic routes

# còn hỗ trợ việc xử lý các providers của các nền tảng như Google, Facebook, Github... (xem thêm ở file auth.ts)

# các file ts được đặt tên file có thêm .d ở giữa để giúp cho ta sử dụng chúng mà ko cần phải import

# Mọi thứ ở đây đều chạy trên server component nên nếu chúg ta muốn sử dụng các eventHandlers cho button thì phải sử dụng 'use-client' như file page.tsx trong folder login.

# next-auth không chỉ làm chức năng login mà còn sử dụng để get session

# NEXTAUTH_SECRET=trungdeptrai được đặt trong file .env dùng để encrypt,dycrypt đặc biệt là tạo JWT để mã hoá.

- Ngoài ra nếu bạn muốn tạo một secure key, cho application của bạn, bạn có thể sử dụng openSSL để tạo một key
- Tải openSSL về máy, sau đó mở command prompt gõ openssl genrsa 2048

# NEXTAUTH_URL : sử dụng để tạo url (url này là một https) , trong quá trình production.

# Cách tạo file [...nextauth] tức là nó sẽ bắt tất cả các segment có liên quan đến api/auth/... (chỉ cần đúng tên api/auth là mọi thứ đều phải chạy qua file này) nhưng ko bắt được chính nó (nếu url chỉ có api/auth thì ko bắt được ) -> có thể xem trên file word drive của phần routing.

# cách đặt tên folder là (auth) hoặc (dashboard) nhằm tránh nó sẽ ảnh hưởng đến các dynamic routes => mục đích của việc này là group lại các url có liên quan đến nhau ví dị (auth) thì sẽ có login, logout, register.

# sử dụng config @tailwindcss/forms bỏ vào chỗ plugin của file tailwind.config.js => mục đích là để các ô input được định dạng chuẩn form.

# zod package will help to do define schemas that are then validating the user input

## useForm: là một hooks của react hook form, giúp cho chúng ta tạo ra 1 object formInstant cung cấp các method (ví dụ: lấy state của form, lấy value của form, set value, refresh,...) tham khảo: https://react-hook-form.com/get-started/

# Tạo ra một custom helpers function để interact với database.

# các event handlers (onClick,...)hoặc các react hooks (useRef, useState,...) cần phải bỏ vào Client Side chứ ko được dùng bên phía Server Side (thêm từ khoá "use client")

# logic trong file auth:

- function jwt: ban đầu token.id sẽ có giá trị là null nên khi dbResult là là null, khi mà dbResult = null (phần if dưới của nó) , kiểm tra user có hay không (user là cái mình được trả về từ google và được tạo bởi next-auth), nếu có thì gán user.id = token.id (khi đó trong type token sẽ ko có props id đâu!! vì vậy chúng ta sẽ thêm props id: string vào type JWT (xem bên file next-auth.d.ts)). cúi cùng return lại token đó gồm 4 giá trị (xem bên file auth.ts phần JWT callbacks) đồng thời dùng JWT_SECRET để mã hoá nó.
- Tiếp đến nó sẽ run một lần nữa, khi đó user sẽ thành undefined, token ở trên mới return khi đó nó đã thành một JWT
  tiếp đến chúng ta lưu nó vào session (nhìn callbacks session).

- Câu hỏi đặt ra, vậy ban đầu token đã có những giá trị gì rồi: thì token mặc định có 4 type
  - name?: string | null
  - email?: string | null
  - picture?: string | null
  - sub?: string
    => khi đó user là giá trị lấy từ nextauth khi ta nhấn vào account của google thì user sẽ liên kết với token , giúp cho token có những giá trị như sau: name của user tương ứng với name của token, ... và chú ý: giá trị của sub trong token chính là id của user. (và type của user chính là những type dựa vào AdapterUser (adapter này chính là type trong database) extends User (User này là mặc định trong nextauth))

# Ở project này có sử dụng kiến thức của redis: có thể gặp một số trường hợp : get, set, zrange, sismember, smembers

- get là dùng để get value dựa vào cái key hoặc get all value
- set là dùng để tạo mới gồm syntax: set <key> <value> đồng thời nếu trong database của redis đã tồn tại key trước đó thì nó sẽ cập nhật value mới (nếu value bị thay đổi).
- sismember: truyền vào cái key, check xem key có value giống nhau với tham số chúng ta truyền vào hay ko (nếu có thì return 1, không thì return 0)
  Ví dụ: file api/friends/add/route.ts (dòng 48,49,50) => chúng đang so sánh giữa value có key là 'user:${idToAdd}:incoming_friend_requests' với session.user.id có giống nhau hay ko.

# Promise.all giúp chúng ta thực hiện một array promise đồng thời.

# Mục đích truyền props từ phía server page xuống client page là để trấnh việc chúng ta phải fetching all that data again ngay tại cái component bên phía server => hạn chế việc dư thừa bộ nhớ.

# Một điều cần lưu ý khi thao tác với database lúc ban đầu: khi mà bạn đã log in với 1 account và cố gắng login một 1 account khác trong khi account ban đầu đã được log in vào web của chúng ta thì sẽ dẫn đến nó sẽ không nhận các account lúc sau.

=> LLý do: bởi vì user sẽ ko thể navigate to the login page anyways khi mà chúng đã đăng nhập (lý do là chúng ta đã protect account ban đầu với 1 cái middleware)
==> cách giải quyết: tạo một nút sign out để tiến hành logout khi mà chúng ta login rồi thì chúng ta tiến hành logout rồi mới chuyển qua chỗ endpoint /login để login bằng google.
(nếu mà xảy ra lỗi trên thì tiến hành xoá lun database trong redis (sử dụng flushall trong phần CLI của redis))

# Để tạo một middleware trong next.js thì chúng ta tiến hành tạo file middleware.ts trong folder src (next sẽ phát hiện được và tiến hành run middleware đó.)

- Lưu ý : vị trí của file middleware trong quá trình chạy project, nó sẽ nằm giữa user -> middleware -> các page (/login,/dashboard,...)

# chú ý chỗ folder: dashboard/chat/[chatId] : chính là một dynamic routes (coi trên google drive của mình)

# -webkit-scrollbar bao gồm 7 phần tử khác nhau và cùng bao gồm một phần tử giao diện thanh cuộn đầy đủ:

::-webkit-scrollbar hình nền của chính thanh cuộn đó.
::-webkit-scrollbar-button các nút định hướng trên thanh cuộn.
::-webkit-scrollbar-track không gian trống bên dưới thanh tiến trình.
::-webkit-scrollbar-track-piece phần trên cùng của thanh tiến trình không bị che bởi ảnh thumb.
::-webkit-scrollbar-thumb phần tử cuộn có thể kéo để thay đổi kích cỡ.
::-webkit-scrollbar-corner góc dưới cùng của phần tử cuộn, nơi hai thanh cuộn gặp nhau.
::-webkit-resizer chỉnh sửa lại kích thước có thể kéo được xuất hiện phía trên thanh cuộn ở góc dưới cùng của một số phần tử.

# lưu ý: sẽ có vài component mình sẽ sử dụng use client để get session hoặc mình có thể truyền session đó xuống các component khác (là một props) mà ko cần phải sử dụng use client cho component đó nếu như chúng ta đã fetch các session trong parent component.

# pusher là một web socket channels (hỗ trợ việc realtime communication) (tham khảo: https://pusher.com/)

- Cách cài đặt: tiến hành tạo một channel sau đấy thì lấy aappKey của nó kết nối với web của chúng ta.

- pusher là một web socket channels mà nó có thể giúp bạn scalable siêu nhanh và họ đã tạo ra websocket connections (đặc biệt là trong serverless app như nextjs)
- cài đặt 2 library: pusher (dành cho server side, distribution các message realtime) và pusher-js(dành cho client side, receiving end of these real-time).

# Sơ đồ chat realtime với pusher:

- from the client side (client chính là người đầu tiên), we can make a post request every time we send a message to the server containing the message content after that pushes message content to the database (ở đây là redis (data being persisted) - sử dụng zset)
- Next, server will send this message to anyone who is subcribed this chat in realtime using web-sockets(nghĩa là server sẽ trả về cho tất cả mọi người mà bất cứ ai trong họ ở trong đoạn chat đó đều được nhận).
- So before even persisting this in the database, it already sends that event out to the client và chat partner (người còn lại trong cuộc hội thoại, nếu là một group chat thì là những người còn lại), therefore we can see message in realtime.
- To do all things upon, we need the server must trigger (chúng ta sẽ logic cái server trong file pusher.ts) then the client to subcribe to any changes and so it receives the notifications from the server..

# Logic realtime của pusher:

- Đầu tiên chúng ta sẽ tiến hành subscribe với pusherKey, tiếp đến chúng ta sẽ tiến hành binding với key và 1 function handler. Khi event useEffect được chạy, nhờ hàm bind chúng ta sẽ bắn tin hiệu xuống cho server, khi đó server sẽ nhận đc 2 key (1 key trong hàm pusher và 1 key trong hàm bind) khi đó server sẽ trigger lại trả về các biến cần thiết, và các biến đó sẽ được truyền vào event handler để xử lý các state ở bên front end.

\*Ví dụ: phần useEffect trong Mesage.ts

# Logic để code notifications friend request.

- trước hết chúng ta cần phải làm process listening to that event on the client (trong file FriendRequests.tsx, phần useEffect đoạn 26)
- Tiếp đến là chúng ta sẽ trigger that event on the server (file route.js trong folder api/friends/add, đoạn 72) , sẽ remove cái notification đó.

# Thuận lợi REDIS:

- Nó vô cùng nhanh khi chúng ta sử dụng realtime chat application.

# trong folder có file loading.tsx dùng để xác định đó là một loading state (skeleton)

# lưu ý: bất kể các div hoặc tag nào cần show ra value thì nếu các bạn muốn làm event loading state, chỉ cần bỏ skeleton trong cái div đó.

# lưu ý: bạn cần phải dependencies for everything from outside and being used inside of the useEffect.

(xem các file loading trong (dashboard)/dashboard)

# Muốn deploy web này lên public thì cần phải check lỗi logic trước bằng cách gõ: npm next lint

# nếu như ko có lỗi thì chúng ta có thể chạy: npm run build -> mục đích : có 2 mục đích

- Thứ nhất là để produce ra giai đoạn production đoạn code của chúng ta -> chúng ta có thể đưa cho tester để họ kiểm tra lỗi.
- Thứ hai là để deploy web lên vercel -> để cho mọi người có thể sử dụng web (nghĩa là web của chúng ta sẽ được public)
