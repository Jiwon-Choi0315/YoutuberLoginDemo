const express = require("express");
const router = express.Router();
router.use(express.json());
const conn = require("../mariadb");
const { body, param, validationResult } = require('express-validator');


const validate = (req, res, next) => {
    const err = validationResult(req);

    if (err.isEmpty()) {
        return next();
    } else {
        return res.status(400).json(err.array());
    }
}


router
    .route("/")
    .post(
        [
            body("uid").notEmpty().isInt().withMessage("유저 ID를 정확하게 입력하세요."),
            body("name").notEmpty().isString().withMessage("채널 명을 정확하게 입력하세요."),
            validate
        ]
        , (req, res) => {
            let { name, uid } = req.body;

            conn.query(
                `INSERT INTO channels (name, uid) VALUES (?, ?)`, [name, uid],
                function (err, results) {
                    if (err) {
                        console.log(err);
                        return res.status(400).end();
                    }

                    res.status(201).json({
                        message: `${name}채널 생성을 축하드립니다..`,
                        result: results
                    });
                }
            )
        }) // 채널 개별 생성
    .get(
        [
            body("uid").notEmpty().isInt().withMessage("숫자를 입력하세요."),
            validate
        ]
        , (req, res) => {
            var { uid } = req.body;

            conn.query(
                `SELECT * FROM channels WHERE uid = ?`, uid,
                (err, results) => {
                    if (err) {
                        return res.status(400).end();
                    }

                    res.status(200).json(results);
                }
            )
        }) // 채널 전체 조회

router
    .route("/:id")
    .put(
        [
            param("id").notEmpty().withMessage("채널 ID 필요"),
            body("name").notEmpty().isString().withMessage("채널 명 오류"),
            validate
        ]
        , (req, res) => {
            let { id } = req.params;
            id = parseInt(id);
            let { name } = req.body;

            conn.query(
                `UPDATE channels SET name = ? WHERE id = ?`, [name, id],
                (err, results) => {
                    if (err) {
                        console.log(err);
                        return res.status(400).end();
                    }

                    res.status(200).json(results);
                }
            )
        }) // 채널 개별 수정    
    .delete(
        [
            param("id").notEmpty().withMessage("채널 ID 필요"),
            validate
        ]
        , (req, res) => {
            let { id } = req.params;
            id = parseInt(id);

            conn.query(
                `DELETE FROM channels WHERE id =  ?`, id,
                function (err, results) {
                    if (err) {
                        console.error("DB 오류 발생: ", err);
                        res.status(400).end();
                    }

                    res.status(200).json(results);
                }
            )
        }) // 채널 개별 삭제
    .get(
        [
            param("id").notEmpty().withMessage("채널 ID 필요"),
            validate
        ]
        , (req, res) => {
            let { id } = req.params;
            id = parseInt(id);

            conn.query(
                `SELECT * FROM channels WHERE id = ?`, id,
                function (err, results) {
                    if (err) {
                        return res.status(400).end();
                    }

                    if (results.length)
                        res.status(200).json(results);
                    else
                        channelNotFound(res);
                }
            );
        }) // 채널 개별 조회

function channelNotFound(res) {
    res.status(404).json({
        message: "해당하는 채널이 없습니다."
    })
}

module.exports = router;