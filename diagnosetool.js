let isShowHistory = false;
let userAnswers = [];
let scoresMaster;
const unselectedClass = 'unselected'; //前へ次へなどが選択できないように
const checkedClass = 'choice'; //このクラスがついている<li>が選択中である

document.addEventListener("DOMContentLoaded", function () {
    // 質問項目のJSONを読みこみ
    var request = new XMLHttpRequest()
    request.onload = function (e) {

        //　エラー処理
        var target = e.target
        if (target.status !== 200) return
        var response
        try {
            response = JSON.parse(target.response)
        } catch (e) {
            alert('診断データが読み込めません。')
            console.error(e)
            return
        }
        startQuestion()

        questionsMaster = response.questions;
        scoresMaster = response.scores;
        setQuestionBar();
        setQuestion(isShowHistory);
    }
    request.open('GET', 'data.json')
    request.send()
});

const startQuestion = function () {
    document.getElementsByClassName('btn_w')[0].addEventListener("click", function (el) {
        setTimeout(function () {
            document.getElementById('diagnosetool_top').style.display = 'none';
            document.getElementById('diagnosetool_question').style.display = 'block';
        }, 200);
    });
}

//ステップバーを質問分作成する
const setQuestionBar = function () {
    const stepbarArea = document.getElementById('stepbar');
    const stepbarUl = stepbarArea.getElementsByTagName('ul')[0];
    for (let i = 0; i < questionsMaster.length; i++) {
        stepbarUl.appendChild(document.createElement("li"));
    }
}

const setQuestion = function (isShowHistory = true, step = 0, isReturn = false) {
    let currentQuestion = questionsMaster[step];
    const questionClassName = 'diagnosis__question--' + currentQuestion.questionId
    const titleQarea = document.getElementById("question_area")
    // 解答一覧の更新
    const currentQuestionDom = titleQarea.getElementsByClassName(questionClassName);
    if (step !== questionsMaster.length - 1) {
        if (currentQuestionDom.length > 0) return
    }

    //1つ前のクラスを探して削除
    let beforeQuestionClassName;
    if (isReturn === false) {
        beforeQuestionClassName = 'diagnosis__question--' + (currentQuestion.questionId - 1);
    } else {
        if (step === questionsMaster.length - 1) {
            beforeQuestionClassName = 'diagnosis__question--' + (currentQuestion.questionId);
        } else {
            beforeQuestionClassName = 'diagnosis__question--' + (currentQuestion.questionId + 1);
        }
    }
    const beforeQuestionDom = titleQarea.getElementsByClassName(beforeQuestionClassName);
    for (let i = beforeQuestionDom.length - 1; i >= 0; i--) {
        beforeQuestionDom[i].remove();
    }
    //新しい選択肢を作成
    currentQuestion.answers.forEach(element => {
        const newLi = document.createElement("li");
        newLi.textContent = element;
        newLi.classList.add('btn');
        newLi.classList.add('btn_q');
        newLi.classList.add(questionClassName);

        titleQarea.appendChild(newLi);
    });

    //ステップバーの更新
    const stepbarArea = document.getElementById('stepbar');
    stepbarArea.getElementsByTagName('li')[step].classList.add('green');

    // 「前へ」、「次へ」のクリック処理
    // 最初は前へに行けない
    // 最後まで行くと結果確認まで行くようにする

    // 「前へ」、「次へ」の選択可否
    const stepArea = document.getElementById("arrow_area");
    // 一番最初は「前へ」を押せない
    const returnArrow = stepArea.getElementsByClassName('return');
    if (step === 0) {
        returnArrow[0].classList.add(unselectedClass);
    } else if (step === 1) {
        returnArrow[0].classList.remove(unselectedClass);
    }


    //前に戻った場合選択肢にchoicedのクラスをつける
    const lists = titleQarea.getElementsByTagName("li");
    const nextArrow = stepArea.getElementsByClassName('next');
    if (userAnswers[step]) {
        //クリックしたら選択中のクラスをつける
        lists[userAnswers[step]['answer']].classList.toggle(checkedClass);
    } else {
        nextArrow[0].classList.add(unselectedClass);
    }
    if (userAnswers[step + 1] || userAnswers.length === questionsMaster.length) {
        //次へが押せるようにする
        nextArrow[0].classList.remove(unselectedClass);
    }

    // 質問内容の更新
    const titleQtext = document.getElementById("question_text")
    if (titleQtext) {
        titleQtext.innerHTML = currentQuestion.question;
    }
    // 質問番号の更新
    const titleQnum = document.getElementById("question_number")
    const questionNum = ('00' + currentQuestion.questionId).slice(-2);
    if (titleQnum) {
        titleQnum.innerHTML = `Question. ${questionNum}`;
    }

    // 解答部分のクリック処理
    for (let i = 0; i < lists.length; i++) {
        // 問題遷移のクリック処理
        lists[i].addEventListener("click", function (el) {
            const targetLi = el.target.innerHTML;

            //スコア配列に入れる
            if (currentQuestion.questionId) {
                userAnswers[step] = {
                    'questionId': currentQuestion.questionId,
                    'answer': i
                }
            }
            if (step < questionsMaster.length - 1) {
                isShowHistory = true;
                return setQuestion(isShowHistory, step + 1, false);
            } else {
                questionEnd();
            }
        });
    }
}

const questionEnd = function () {
    const btnAnswer = document.getElementsByClassName('btn btn_answer')[0];
    //最終問題までいくと結果を見るに遷移
    btnAnswer.style.pointerEvents = 'auto';

    scoreAggregation(btnAnswer);
    document.getElementById('diagnosetool_question').style.display = 'none';
    document.getElementById('diagnosetool_question_end').style.display = 'block';
    window.location.href = '#diagnosetool_question_end';
}

//「前へ」
const returnStep = function () {
    const step = document.getElementsByClassName('green').length - 1;
    if (step > 0) {
        //ステップバーの更新
        const stepbarArea = document.getElementById('stepbar');
        stepbarArea.getElementsByTagName('li')[step].classList.remove('green');
        return setQuestion(isShowHistory, step - 1, true);
    }
}

//「次へ」
const nextStep = function () {
    const step = document.getElementsByClassName('green').length - 1;
    if (userAnswers[step + 1]) {
        if (step < questionsMaster.length - 1) {
            return setQuestion(isShowHistory, step + 1, false);
        }
    }else if(step === questionsMaster.length - 1){
        questionEnd();
    }
}

//一つ前の質問に戻る
const returnQuestion = function () {
    document.getElementById('diagnosetool_question').style.display = 'block';
    document.getElementById('diagnosetool_question_end').style.display = 'none';
    const step = questionsMaster.length - 1;
    return setQuestion(isShowHistory, step, true);
}

//モーダルを作成
const generateModal = function () {
    const datailArea = document.getElementsByClassName('detail');

    for (let j = 0; j < datailArea.length; j++) {
        datailArea[j].addEventListener("click", function (el) {
            setTimeout(function () {
                const name = document.getElementsByClassName('name')[j].innerText;
                const dataId = datailArea[j].id;
                document.getElementsByClassName('list')[0].innerHTML = `詳細＞${name}`;
                document.getElementsByClassName('case')[0].getElementsByTagName('a')[0].setAttribute('href', scoresMaster[dataId].url);
                for (let i = 0; i < questionsMaster.length; i++) {
                    const questionArray = questionsMaster[i];
                    const modalUlArea = document.getElementsByClassName('item')[0].getElementsByTagName('ul')[0];
                    const newLi = document.createElement("li");
                    const questionList = modalUlArea.appendChild(newLi);

                    let newDiv = document.createElement("div");
                    newDiv.classList.add('question');
                    let questionDiv = questionList.appendChild(newDiv);
                    let questionSpan = questionDiv.appendChild(document.createElement("span"));
                    const questionNum = ('00' + (i + 1)).slice(-2);
                    questionSpan.textContent = `Q${questionNum}.`;
                    let questionPtag = questionDiv.appendChild(document.createElement("p"));
                    questionPtag.textContent = questionArray.question;

                    newDiv = document.createElement("div");
                    newDiv.classList.add('answer');
                    let answer = '';
                    switch (scoresMaster[dataId].data[i].score[0]) {
                        case 5:
                        case 10:
                            answer = '◯';
                            break;
                        case 1:
                            answer = '×'
                            break;
                    }
                    newDiv.innerHTML = `${answer}`;
                    questionDiv = questionList.appendChild(newDiv);
                }

                document.getElementById('modal_page').style.display = 'flex';
                document.getElementsByTagName('body')[0].style.overflowY = 'hidden';
            }, 200);
        });

        // モーダル閉じるボタン
        document.getElementsByClassName('close_btn')[0].addEventListener("click", function (el) {
            setTimeout(function () {
                //モーダル
                const itemArea = document.getElementsByClassName('item')[0];
                itemArea.getElementsByTagName('ul')[0].remove();
                const newUl = document.createElement("ul");
                itemArea.appendChild(newUl);
                document.getElementById('modal_page').style.display = 'none';
                document.getElementsByTagName('body')[0].style.overflowY = 'auto';
            }, 200);
        });
    }
}

const scoreAggregation = function (btnAnswer) {
    const scores = [];
    //スコアの集計
    btnAnswer.addEventListener("click", function (el) {
        setTimeout(function () {
            //プランごとにループ
            for (let i = 0; i < scoresMaster.length; i++) {
                const scoreArray = scoresMaster[i];
                scores[i] = {
                    'name': scoreArray.name,
                    'id': i,
                    'score': 0
                }
                //解答ごとにループ
                for (let j = 0; j < scoreArray.data.length; j++) {
                    const userAnswer = userAnswers[j].answer;
                    //スコアを加算
                    scores[i]['score'] += scoreArray.data[j].score[userAnswer];
                }
            }

            //スコアの高い順にソート
            scores.sort(function (a, b) {
                if (a.score > b.score) return -1;
                if (a.score < b.score) return 1;
                return 0;
            });

            //結果一覧を生成する
            const resultLi = document.getElementById('result_area').getElementsByTagName('li');
            if (resultLi.length > 0) return;
            for (let s = 0; s < scores.length; s++) {
                generateResultList(s, scores[s])
            }
            //一番高かったサービス名表示
            document.getElementsByClassName('service_name')[0].textContent = scores[0].name;
            generateModal();

            document.getElementById('diagnosetool_question_end').style.display = 'none';
            document.getElementById('diagnosetool_answer').style.display = 'block';

            document.getElementsByClassName('btn btn_challenge')[0].addEventListener("click", function (el) {
                //リセット
                document.getElementById('diagnosetool_answer').style.display = 'none';
                document.getElementById('diagnosetool_question').style.display = 'block';
                userAnswers = [];
                const btnqQuestionDom = document.getElementsByClassName('btn_q');
                for (let i = btnqQuestionDom.length - 1; i >= 0; i--) {
                    btnqQuestionDom[i].remove();
                }
                const stepbarArea = document.getElementById('stepbar');
                const stepbarLi = stepbarArea.getElementsByTagName('li');
                for (let i = 0; i < stepbarLi.length; i++) {
                    stepbarLi[i].classList.remove('green');
                }
                const resultUl = document.getElementById('result_area');
                while (resultUl.lastChild) {
                    resultUl.removeChild(resultUl.lastChild);
                }

                setQuestion(isShowHistory, 0);
            });
        }, 200);
    });

    //結果一覧作成
    const generateResultList = function (num, data) {
        const resultArea = document.getElementById('result_area')
        const listNum = ('00' + (num + 1)).slice(-2);
        const newLi = document.createElement("li");

        newLi.classList.add('lank_' + listNum);
        const resultList = resultArea.appendChild(newLi);

        let newDiv = document.createElement("div");
        newDiv.classList.add('name');
        let resultDiv = resultList.appendChild(newDiv);
        let resultPtag = resultDiv.appendChild(document.createElement("p"))
        let newAtag = document.createElement("a");
        newAtag.textContent = data.name;
        newAtag.href = "#";
        resultPtag.appendChild(newAtag);

        newDiv = document.createElement("div");
        newDiv.classList.add('bar');
        resultDiv = resultList.appendChild(newDiv);

        let newChildDiv = document.createElement("div");
        newChildDiv.classList.add('barwidth');
        newChildDiv.style.width = `${data.score}%`;

        let resultChildDiv = resultDiv.appendChild(newChildDiv);

        newDiv = document.createElement("div");
        newDiv.classList.add('number');
        resultDiv = resultList.appendChild(newDiv);

        const newPtag = document.createElement("p");
        newPtag.textContent = `${data.score}`;
        resultPtag = resultDiv.appendChild(newPtag);
        const newSpan = document.createElement("span");
        newSpan.textContent = '%';
        resultPtag.appendChild(newSpan);

        newDiv = document.createElement("div");
        newDiv.classList.add('detail');
        resultDiv = resultList.appendChild(newDiv);
        newAtag = document.createElement("a");
        newAtag.textContent = '詳細へ';
        resultDiv.setAttribute('id', data['id']);
        newAtag.href = "#modal_page";
        resultDiv.appendChild(newAtag);
    }
}
