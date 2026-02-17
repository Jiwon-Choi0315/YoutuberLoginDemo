const express = require("express");
const router = express.Router();
router.use(express.json());
const conn = require("../mariadb");

let db = new Map();
var id = 1;

router
    .route("/")
    .post((req, res) => {
        const {channelTitle} = req.body;
        let {name, uid} = req.body;

        conn.query(
        `INSERT INTO channels (name, uid)
        VALUES (?, ?)`, [name, uid],
        function (err, results) {
            if (err) {
                // 터미널에서 오류 확인할 수 있음
                console.error("DB 오류 발생: ", err);
                res.status(500).json({ message: "DB 저장 중 에러가 발생했습니다." });
            } else {
                res.status(201).json({
                    message: `${name}채널 생성을 축하드립니다..`,
                    result: results
                });
            }
        }
    );
    }) // 채널 개별 생성
    .get((req, res) => {
        var {uid} = req.body;

        if(uid) {
            conn.query(
                `SELECT * FROM channels WHERE uid = ?`, uid,
                function (err, results) {
                    if (results.length) {
                        res.status(200).json(results);
                    } else {
                        res.status(404).json({ message: "해당 사용자를 찾지 못했습니다." });
                    }
                }
            )
        } else {
            res.status(400).end();
        }

        // var {userId} = req.body;
        // var channels = [];

        // // userId가 body에 존재하는 경우
        // if (db.size && userId) {
        //     db.forEach((value, key) => {
        //         if (value.userId == userId) {
        //             channels.push(value);
        //         }
        //     })

        //     // 해당 사용자가 소유한 채널이 존재하는 경우
        //     if (channels.length) {
        //         res.json(channels);
        //     }
        //     else {
        //         channelNotFound(res);
        //     }
        // }
        // else {
        //     channelNotFound(res);
        // }
    }) // 채널 전체 조회

router
    .route("/:id")
    .put((req, res) => {
        let {id} = req.params;
        id = parseInt(id);

        let channel = req.body;
        let oldTitle = db.get(id).channelTitle;

        if (channel) {
            let newTitle = channel.channelTitle;
            db.set(id).channelTitle = newTitle;
            
            res.status(200).json({
                message: `채널명이 ${oldTitle}에서 ${newTitle}로 변경되었습니다.`
            })
        } 
        else {
            channelNotFound();
        }
    }) // 채널 개별 수정    
    .delete((req, res) => {
        let {id} = req.params;
        id = parseInt(id);

        var channel = db.get(id);

        if (channel) {
            db.delete(id);
            res.status(200).json({
                message: `${channel.channelTitle} 채널이 성공적으로 삭제되었습니다.`
            });
        }
        else {
            channelNotFound();
        }
    }) // 채널 개별 삭제
    .get((req, res) => {
        let {id} = req.params;
        id = parseInt(id);

        conn.query(
            `SELECT * FROM channels WHERE id = ?`, id,
            function (err, results) {
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