const express = require('express');
const router = express.Router();
router.use(express.json());

console.log("App is running on port 1234.");


// 로그인
router.post("/login", (req, res) => {
    let {uid} = req.body;
    let {pwd} = req.body;
    let user = db.get(uid);

    if (user) {
        if (user.pwd == pwd){
            res.json({message: `${db.get(uid).name}님의 로그인을 환영합니다.`})
        }
        else {
            res.status(404).json({message: "비밀번호가 틀렸습니다."});
        }
    }
    else {
        res.status(404).json({message: "해당 사용자를 찾지 못했습니다."});
    }
})

// 회원가입
router.post("/signup", (req, res) => {
    let {uid} = req.body;
    let {name} = req.body;
    db.set(uid, req.body);

    if (uid && name && req.body.pwd) {
        res.status(201).json({
        message: `${name}님의 회원가입을 환영합니다.`
        })
    }
    else {
        res.status(400).json({message: "입력된 정보가 잘못되었습니다."});
    }

})

router
    .route("/users")
    // 회원 정보 개별 조회
    .get((req, res) => {
        let {uid} = req.body;

        if (db.get(uid)) {
            let name = db.get(uid).name;

            res.status(200).json({
                message: `uid: ${uid}, name: ${name}`
            })
        }
        else {
            res.status(404).json({message: "해당 사용자를 찾지 못했습니다."});
        }
    })

    // 회원 개별 탈퇴
    .delete((req, res) => {
        let {uid} = req.params;

        if (db.get(uid)) {
            let name = db.get(uid).name;
            
            db.delete(uid);

            res.status(200).json({
                message: `${name}님 나중에 다시 보기를 바라겠습니다.`
            })
        }
        else {
            res.status(404).json({message: "해당 사용자를 찾지 못했습니다."});
        }
    })

router.delete("/users/:uid", (req, res) => {
    let {uid} = req.params;

    if (db.get(uid)) {
        let name = db.get(uid).name;
        
        db.delete(uid);

        res.status(200).json({
            message: `${name}님 나중에 다시 보기를 바라겠습니다.`
        })
    }
    else {
        res.status(404).json({message: "해당 사용자를 찾지 못했습니다."});
    }
})


let db = new Map;
var id = 1;

module.exports = router;