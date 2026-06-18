/* =========================================================
   ■ バージョン更新時のキャッシュクリア
   ========================================================= */
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready
        .then(() => {
            const savedVersion = localStorage.getItem("app_version");

            if (typeof APP_VERSION !== "undefined" && savedVersion !== APP_VERSION) {
                localStorage.setItem("app_version", APP_VERSION);

                if ("caches" in window) {
                    caches.keys().then((names) => {
                        for (const name of names) {
                            caches.delete(name);
                        }
                    });
                }
            }
        })
        .catch((err) => {
            console.warn("serviceWorker.ready の取得に失敗:", err);
        });
}

/* =========================================================
   ■ グローバル変数
   ========================================================= */
let allResults = [];
let selectedCategory = 1;
let selectedTopic = 1;
let studentCount = 0;
let studentNames = [];

const categoryNames = {
    1: "BHS基礎",
    2: "BHS歌",
    3: "BHS食と育ち",
    4: "BHS総合"
};

/* =========================================================
   ■ データ保存・復元
   ========================================================= */
function saveAppState() {
    const state = {
        allResults,
        selectedCategory,
        selectedTopic,
        studentCount,
        studentNames,
        currentScreen: document.querySelector(".screen.active")?.id || "startScreen"
    };
    localStorage.setItem("bhs_app_backup", JSON.stringify(state));
}

window.addEventListener("load", () => {
    const savedData = localStorage.getItem("bhs_app_backup");

    if (!savedData) {
        showScreen("startScreen");
        return;
    }

    try {
        const state = JSON.parse(savedData);
        allResults = state.allResults || [];
        selectedCategory = state.selectedCategory || 1;
        selectedTopic = state.selectedTopic || 1;
        studentCount = state.studentCount || 0;
        studentNames = state.studentNames || [];

        const currentScreen = state.currentScreen || "startScreen";
        showScreen(currentScreen);

        if (currentScreen === "nameScreen") {
            renderNameInputs();
        } else if (currentScreen === "checkScreen") {
            generateCheckScreen();
        }
    } catch (e) {
        console.error("保存データの読み込みに失敗しました:", e);
        localStorage.removeItem("bhs_app_backup");
        showScreen("startScreen");
    }
});

/* =========================================================
   ■ 画面遷移
   ========================================================= */
function showScreen(id) {
    document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
    const target = document.getElementById(id);
    if (target) {
        target.classList.add("active");
        window.scrollTo(0, 0);
    }
}

function clearInputViews() {
    const countInput = document.getElementById("studentCount");
    if (countInput) countInput.value = "";

    const nameList = document.getElementById("nameList");
    if (nameList) nameList.innerHTML = "";

    const checkItems = document.getElementById("checkItems");
    if (checkItems) checkItems.innerHTML = "";
}

function goToTop() {
    localStorage.removeItem("bhs_app_backup");
    allResults = [];
    selectedCategory = 1;
    selectedTopic = 1;
    studentCount = 0;
    studentNames = [];
    clearInputViews();
    showScreen("startScreen");
}

function goToStart() {
    showScreen("topScreen");
    saveAppState();
}

function goToStartScreen() {
    goToStart();
}

function selectCategory(num) {
    selectedCategory = num;
    selectedTopic = 1;
    showScreen("countScreen");
    saveAppState();
}

function backToTop() {
    showScreen("topScreen");
    saveAppState();
}

function backToCount() {
    showScreen("countScreen");
    saveAppState();
}

function backToNameInput() {
    showScreen("nameScreen");
    saveAppState();
}

function backToLastTopic() {
    const topicCount = getCategoryTopicCount(selectedCategory);
    selectedTopic = topicCount;
    generateCheckScreen();
    showScreen("checkScreen");
    saveAppState();
}

function backToPreviousTopic() {
    if (selectedTopic > 1) {
        selectedTopic--;
        generateCheckScreen();
        saveAppState();
    } else {
        showScreen("nameScreen");
        saveAppState();
    }
}

/* =========================================================
   ■ 名前入力
   ========================================================= */
function renderNameInputs() {
    const nameList = document.getElementById("nameList");
    if (!nameList) return;

    nameList.innerHTML = "";
    for (let i = 1; i <= studentCount; i++) {
        const savedName = studentNames[i - 1] || "";
        nameList.innerHTML += `
            <div class="nameRow">
                ${i}：<input type="text" id="name${i}" class="inputBox" placeholder="名前"
                       value="${savedName}" oninput="updateStudentNames()">
            </div>
        `;
    }
}

function updateStudentNames() {
    studentNames = [];
    for (let i = 1; i <= studentCount; i++) {
        const input = document.getElementById(`name${i}`);
        const name = input && input.value.trim() ? input.value.trim() : `受験生${i}`;
        studentNames.push(name);
    }
    saveAppState();
}

function goToNameInput() {
    const countVal = document.getElementById("studentCount").value;
    studentCount = Number(countVal);

    if (!studentCount || studentCount < 1) {
        alert("人数を入力してください");
        return;
    }

    renderNameInputs();
    showScreen("nameScreen");
    saveAppState();
}

function goToCheck() {
    updateStudentNames();
    generateCheckScreen();
    showScreen("checkScreen");
    saveAppState();
}

/* =========================================================
   ■ お題名（カテゴリ別）
   ========================================================= */
const categoryTopicNames = {
    1: {
        1: "頭皮", 2: "耳（日本手ぬぐい）", 3: "顔", 4: "口の中", 5: "からだのまえ",
        6: "おなかをゆるめる", 7: "てのひら", 8: "足ゆびと足うら", 9: "からだのうしろ", 10: "ふともものまわりとおしり"
    },
    2: {
        1: "歌1（今後アップデート予定）"
    },
    3: {
        1: "食と育ち1（今後アップデート予定）"
    },
    4: {
        1: "総合1（今後アップデート予定）"
    }
};

function getCategoryTopicCount(category) {
    return Object.keys(categoryTopicNames[category]).length;
}

function getTopicName(category, topic) {
    return categoryTopicNames[category][topic] || `お題${topic}`;
}

/* =========================================================
   ■ チェック項目データ
   ========================================================= */
const categoryItems = {
    1: {
        1: [
            "後頭部、頭蓋骨の下からスタートできている",
            "指の腹を使い優しく横に揺らしてできている",
            "毛の生え際から中央に向かってマッサージする",
            "終わりの位置があっている",
            "横から前は生え際から中央に向かってマッサージする",
            "８分割全てをマッサージできている"
        ],
        2: [
            "人差し指で耳の付け根の上部からスタート（体が真っ直ぐになっている）",
            "耳の付け根を剥がすイメージで、耳の後ろの周りをくるくるとマッサージする",
            "耳の一番下のところに人差し指をあてて、頭頂に向かって持ち上げる",
            "人差し指で、耳のみぞ、最後に耳の穴を洗う感じでマッサージする",
            "親指と人差し指か、中指で、上、真ん中、下の3箇所を指先か手首を使って引く"
        ],
        3: [
            "手をあてる位置が合っている",
            "頬骨に親指が当たっている",
            "手のひらでピッタリと頬を包み込んでいる",
            "耳を人差し指・中指が挟んでいる",
            "薬指が後頭部についている",
            "回し方（上→外→下）があっている"
        ],
        4: [
            "口角から人差し指を頬の丸みに沿っていれている",
            "奥からジグザグジグザグできている",
            "頬の内側を奥から頬を膨らませるように指全体を使ってできている"
        ],
        5: [
            "耳の後ろの窪みからスタート",
            "している側の方に触れていられる",
            "耳の後ろから頭蓋骨の下側を形に沿って首の後ろまでできている",
            "首の後ろから顎の下まで",
            "顎の下で縦にタオルを使い、舌骨上筋群舌尖まで顎の内側をできる",
            "鎖骨の上を脇の下まで横に移動しながらできる",
            "脇の下までしっかりはいれる"
        ],
        6: [
            "片方の手を肋骨の下に手のひらに隙間なく",
            "もう一方の手を背、肋骨、骨盤の間に中指を入れて手のひらで隙間なく優しく包み込む",
            "ゆっくり呼吸に合わせて、手をお腹に沿わせておける"
        ],
        7: [
            "下の手（利き手ではない手）で手を支え、上の手（利き手）の親指を手のひらの中心に置く",
            "下の手で上の親指を手のひら全体でくるむように丸くしていく",
            "親指と人差し指の間から、小指側の手首に向かって親指で生命線をなぞるイメージで斜め下に３回マッサージを行う",
            "親指と中指か人差し指で、親指と小指の付け根の関節をくっつけるように、中心に向かってあわせる"
        ],
        8: [
            "歯ブラシの持ち方があっている",
            "親指と人差し指の間にブラシを優しく入れることができる",
            "まっすぐ、親指側、人差し指側とマッサージする、全ての指を同様にマッサージする",
            "爪のはえぎわを横にずらしながらマッサージする",
            "爪、皮膚の間、皮膚を横に流れるようにマッサージする",
            "足裏の指の根本から、指の付け根をくるくるマッサージする",
            "かかへ移り、くるくると歯ブラシを回すことができる",
            "かかとから親指と人差し指の間を歯ブラシで抜けてマッサージする"
        ],
        9: [
            "頭部、スタートの位置があっている",
            "背骨の脇から終了の位置があっている",
            "頭部からスタートし、肩甲骨の内側にタオルをいれるようにしてできる",
            "頭部からスタートして背骨に近いところから骨盤の上を通ってウエストにぬける"
        ],
        10: [
            "スタートの位置にいられる（頭から足先までを真っ直ぐに寝る）",
            "足の膝を持って、胸に近づけその後、足を直角にできる",
            "【足の前】左手でふくらはぎの後ろを包み込むように持つ。右手で膝をつつみ、足の中心の部分を膝からまっすぐ腹部に向かって、手をミトンのような形にしてマッサージする",
            "【足の内側】足を胸に近づけ、①お尻を包みあげるように足を右側（外側）に回すようにしながら倒し、右手で足を固定。②左手で膝をつつみ、内側の大腿部分を股関節に向かってマッサージする。③股関節に小指があたったら、さらに親指がひと回り奥へできる",
            "【足の後ろ側】①足は直角にし、左手でふくらはぎを持ち固定。②右手はちょうだいの手にして、膝の裏側からお尻に向かってマッサージする。③ヒップラインをつくれる。④掌が浮かないように体を使って行う",
            "【足の外側】①お尻を上げるようにし、逆の方に向かって膝がくるように固定。②右手で膝を包み込む。③その手で太ももの外側の部分を手のひらでマッサージする",
            "【お尻】太ももの横をマッサージしてきて、①お尻のくぼんだ部分に右手の母指球をあて、②体重を肩の方向にかけてマッサージできる",
            "足を右側（外側）に倒し、右手で足を固定する",
            "左手で膝をつつみ、内側の大腿部分を膝から陰部に向かってマッサージする",
            "小指が股関節にあたったら、親指をさらに深くマッサージできる",
            "左手で足を固定し、右手をちょうだいの手にして、大腿の裏側からお尻の部分を膝からお尻に向かってヒップアップをイメージしながらマッサージする",
            "一度足を中心に戻し、そのあとに左側（内側）に倒し、左手で足を固定する",
            "子どもの太ももの外側の部分を右手で膝の部分からお尻に向かってマッサージする",
            "お尻のくぼんだ部分を右手の母指球の部分を使って、ぐるぐると体重をのせながらマッサージする"
        ]
    },
    2: {
        1: [
            "BHS歌のチェック項目1（今後アップデート予定）",
            "BHS歌のチェック項目2（今後アップデート予定）",
            "BHS歌のチェック項目3（今後アップデート予定）"
        ]
    },
    3: {
        1: [
            "BHS食と育ちのチェック項目1（今後アップデート予定）",
            "BHS食と育ちのチェック項目2（今後アップデート予定）",
            "BHS食と育ちのチェック項目3（今後アップデート予定）"
        ]
    },
    4: {
        1: [
            "BHS総合のチェック項目1（今後アップデート予定）",
            "BHS総合のチェック項目2（今後アップデート予定）",
            "BHS総合のチェック項目3（今後アップデート予定）"
        ]
    }
};

/* =========================================================
   ■ チェック画面の生成
   ========================================================= */
function findResult(category, topic, item, name) {
    return allResults.find(r => r.category === category && r.topic === topic && r.item === item && r.name === name);
}

function generateCheckScreen() {
    const items = categoryItems[selectedCategory][selectedTopic];
    const topicName = getTopicName(selectedCategory, selectedTopic);
    const topicCount = getCategoryTopicCount(selectedCategory);
    const checkItemsEl = document.getElementById("checkItems");

    if (!items || !checkItemsEl) return;

    let html = `<h2 class="subtitle">【${categoryNames[selectedCategory]}：${selectedTopic}：${topicName}】</h2>`;

    items.forEach((item, itemIndex) => {
        html += `
            <div class="itemBlock">
                <div class="itemTitle">【${selectedTopic} ${topicName}：項目${itemIndex + 1}】${item}</div>
                <div class="checksRow">
        `;

        studentNames.forEach((name, studentIndex) => {
            const saved = findResult(selectedCategory, selectedTopic, item, name);
            const isChecked = saved && saved.check === "○" ? "on" : "";
            html += `
                <div class="checkCell">
                    <span class="checkName">${name}</span>
                    <div class="checkBox ${isChecked}" id="chk_${itemIndex}_${studentIndex}"
                         onclick="toggleCheck('${itemIndex}_${studentIndex}'); saveCheck(${itemIndex}, ${studentIndex})"></div>
                </div>
            `;
        });

        html += `</div><div class="notesLabel">備考：</div><div class="notesRow">`;

        studentNames.forEach((name, studentIndex) => {
            const saved = findResult(selectedCategory, selectedTopic, item, name);
            const noteValue = saved ? saved.note : "";
            html += `
                <div class="noteCell">${name}：
                    <textarea id="note_${itemIndex}_${studentIndex}" class="noteArea"
                              oninput="saveCheck(${itemIndex}, ${studentIndex})">${noteValue}</textarea>
                </div>
            `;
        });

        html += `</div></div><hr>`;
    });

    checkItemsEl.innerHTML = html;
    window.scrollTo(0, 0);

    const backBtn = document.getElementById("checkBackBtn");
    const nextBtn = document.getElementById("checkNextBtn");
    if (backBtn) backBtn.textContent = selectedTopic === 1 ? "戻る" : "前の項目へ";
    if (nextBtn) nextBtn.textContent = selectedTopic === topicCount ? "完了" : "次の項目へ";
}

function toggleCheck(id) {
    const el = document.getElementById("chk_" + id);
    if (el) el.classList.toggle("on");
}

/* =========================================================
   ■ 保存・進行ロジック
   ========================================================= */
function saveAndNext() {
    saveCurrentTopicToMemory();
    const topicCount = getCategoryTopicCount(selectedCategory);
    if (selectedTopic < topicCount) {
        selectedTopic++;
        generateCheckScreen();
        saveAppState();
    } else {
        showScreen("finishScreen");
        saveAppState();
    }
}

function saveCurrentTopicToMemory() {
    const items = categoryItems[selectedCategory][selectedTopic];
    if (!items) return;

    studentNames.forEach((name, studentIndex) => {
        items.forEach((item, itemIndex) => {
            const checkBtn = document.getElementById(`chk_${itemIndex}_${studentIndex}`);
            const noteEl = document.getElementById(`note_${itemIndex}_${studentIndex}`);
            if (!checkBtn || !noteEl) return;

            const checked = checkBtn.classList.contains("on") ? "○" : "";
            const note = noteEl.value;

            const existing = findResult(selectedCategory, selectedTopic, item, name);
            if (existing) {
                existing.check = checked;
                existing.note = note;
            } else {
                allResults.push({ category: selectedCategory, topic: selectedTopic, item, name, check: checked, note });
            }
        });
    });
}

function saveCheck(itemIndex, studentIndex) {
    const item = categoryItems[selectedCategory][selectedTopic]?.[itemIndex];
    const name = studentNames[studentIndex];
    const checkBtn = document.getElementById(`chk_${itemIndex}_${studentIndex}`);
    const noteEl = document.getElementById(`note_${itemIndex}_${studentIndex}`);

    if (!item || !name || !checkBtn || !noteEl) return;

    const checked = checkBtn.classList.contains("on") ? "○" : "";
    const note = noteEl.value;

    const existing = findResult(selectedCategory, selectedTopic, item, name);
    if (existing) {
        existing.check = checked;
        existing.note = note;
    } else {
        allResults.push({ category: selectedCategory, topic: selectedTopic, item, name, check: checked, note });
    }

    saveAppState();
}

/* =========================================================
   ■ Excel保存
   ========================================================= */
function saveAllExcel() {
    const wb = XLSX.utils.book_new();

    studentNames.forEach((name) => {
        const sheetData = [["カテゴリ", "お題", "項目", "チェック", "備考"]];

        [1, 2, 3, 4].forEach(category => {
            const topicCount = getCategoryTopicCount(category);
            for (let topic = 1; topic <= topicCount; topic++) {
                const items = categoryItems[category][topic];
                const topicName = getTopicName(category, topic);
                items.forEach(item => {
                    const row = allResults.find(r => r.category === category && r.topic === topic && r.item === item && r.name === name);
                    sheetData.push([categoryNames[category], topicName, item, row ? row.check : "", row ? row.note : ""]);
                });
            }
        });

        const ws = XLSX.utils.aoa_to_sheet(sheetData);
        ws["!cols"] = [{ wch: 20 }, { wch: 25 }, { wch: 80 }, { wch: 10 }, { wch: 90 }];

        const range = XLSX.utils.decode_range(ws["!ref"]);
        for (let R = 0; R <= range.e.r; R++) {
            for (let C = 0; C <= range.e.c; C++) {
                const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
                if (!ws[cellAddress]) continue;
                ws[cellAddress].s = {
                    alignment: { wrapText: true, vertical: "top" },
                    font: { sz: 12 }
                };
            }
        }

        XLSX.utils.book_append_sheet(wb, ws, name);
    });

    const today = new Date();
    const fileName =
        `BHS_${today.getFullYear()}` +
        `${String(today.getMonth() + 1).padStart(2, "0")}` +
        `${String(today.getDate()).padStart(2, "0")}.xlsx`;

    XLSX.writeFile(wb, fileName);
}
