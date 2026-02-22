const express = require('express');
const router = express.Router();
router.use(express.json());
const conn = require('../mariadb');
const { body, param, validationResult } = require("express-validator");

//JWT
const jwt = require("jsonwebtoken");

//dotenve
const dotenv = require("dotenv").config();


console.log("App is running on port 1234.");

const validate = (req, res, next) => {
    const err = validationResult(req);

    if (err.isEmpty) {
        return next();
    } else {
        return res.status(400).json(err.array());
    }
}


// 로그인
router.post(
    "/login",
    [
        body("email").notEmpty().isEmail().withMessage("이메일이 틀렸습니다."),
        body("password").notEmpty().isString().withMessage("비밀번호가 틀렸습니다."),
        validate
    ]
    , (req, res) => {
        const { email, password } = req.body;

        conn.query(
            `SELECT * FROM users WHERE email = ?`, email,
            function (err, results) {
                if (err) {
                    return res.status(400).end();
                }

                let user = results[0];

                if (user && password == user.password) {
                    // token 발급
                    const token = jwt.sign({
                        id: user.id,
                        email: user.email,
                        name: user.name
                    }, process.env.PRIVATE_KEY, {
                        expiresIn: "1h",
                        issuer: "I myself"
                    });

                    res.cookie("token", token, {httpOnly: true});
                    res.status(200).json({message: `${user.name}님 환영합니다.`});
                } else {
                    res.status(403).json({ message: "입력한 정보가 틀렸습니다." });
                }
            }
        );
    })

// 회원가입
router.post(
    "/signup",
    [
        body("email").notEmpty().isEmail().withMessage("이메일을 다시 확인해 주세요."),
        body("name").notEmpty().isString().withMessage("이름을 다시 확인해 주세요."),
        body("password").notEmpty().isString().withMessage("비밀번호를 다시 확인해 주세요."),
        body("contact").notEmpty().isString().withMessage("전화번호를 다시 확인해 주세요."),
        validate
    ]
    , (req, res) => {
        const { email, name, password, contact } = req.body;

        conn.query(
            `INSERT INTO users (email, name, password, contact)
            VALUES (?, ?, ?, ?)`, [email, name, password, contact],
            function (err, results) {
                if (err) {
                    console.error("DB 오류 발생: ", err);
                    res.status(500).json({ message: "DB 저장 중 에러가 발생했습니다." });
                } else {
                    res.status(201).json({
                        message: `${name}님의 회원가입을 환영합니다.`,
                        result: results
                    });
                }
            }
        );
    })

router
    .route("/users")
    // 회원 정보 개별 조회
    .get(
        [
            body("email").notEmpty().isString().withMessage("이메일을 다시 확인해 주세요."),
            validate
        ]
        , (req, res) => {
            let { email } = req.body;

            conn.query(
                `SELECT * FROM users WHERE email = ?`, email,
                function (err, results) {
                    if (err) {
                        return res.status(400).end();
                    }

                    if (results.length)
                        res.status(200).json(results);
                    else
                        res.status(404).json({ message: "해당 사용자를 찾지 못했습니다." });
                }
            );
        })

    // 회원 개별 탈퇴
    .delete(
        [
            body("email").notEmpty().isString().withMessage("이메일을 다시 확인해 주세요."),
            validate
        ]
        , (req, res) => {
            const { email } = req.body;
            var name = "";

            // 메세지에 출력할 이름 미리 찾아놓기
            conn.query(
                `SELECT name FROM users WHERE email =  ?`, email,
                function (err, results) {
                    // 삭제할 대상의 이름을 찾으면
                    if (results.length) {
                        if (err) {
                            console.error("DB 오류 발생: ", err);
                            res.status(500).json({ message: "유저를 검색하는 과정에서 오류가 발생했습니다." });
                        } else {
                            name = results[0].name;
                        }
                    }
                    // 삭제할 대상이 없는 경우 
                    else {
                        console.error("삭제할 대상이 존재하지 않음")
                        res.status(404).json({ message: "삭제할 대상을 찾지 못했습니다." });
                    }


                    // 유저 삭제하기
                    conn.query(
                        `DELETE FROM users WHERE email =  ?`, email,
                        function (err, results) {
                            if (err) {
                                console.error("DB 오류 발생: ", err);
                                res.status(500).json({ message: "유저를 삭제하는 과정에서 오류가 발생했습니다." });
                            } else {
                                res.status(200).json({
                                    message: `${name}님 다시 만나기를 기대하겠습니다.`,
                                    result: results
                                })
                            }
                        }
                    )
                }
            )
        })


module.exports = router;