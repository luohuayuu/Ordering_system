const express = require('express');
const mysql = require('mysql2');
const app = express();
const port = 3000;  // 修改为端口 3000
const cors = require('cors');

app.use(cors());
app.use(express.json());  // 解析 JSON 数据

// 数据库连接配置
//使用时先修改密码和数据库名称，一致才能连接成功
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '12qwaszx',  // 如果没有密码则为空
    database: 'ordering_system'  // 使用 'order_system' 数据库
});

db.connect((err) => {
    if (err) {
        console.error('无法连接到 MySQL 数据库:', err);
        return;
    }
    console.log('MySQL 数据库已连接.');
});

// 提交投诉与建议的 API
app.post('/submit-feedback', (req, res) => {
    const { name, email, message } = req.body;

    // 插入数据到数据库
    const query = 'INSERT INTO feedbacks (name, email, message) VALUES (?, ?, ?)';
    db.query(query, [name, email, message], (err, result) => {
        if (err) {
            console.error('数据库插入失败:', err);
            res.status(500).send('提交失败，请稍后再试。');
        } else {
            res.send('感谢您的反馈，您的投诉与建议已提交！');
        }
    });
});
// 获取菜品信息的 API
app.get('/api/menu', (req, res) => {
    db.query('SELECT id, name, cuisine, price, image FROM menu', (err, results) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(results);
        }
    });
});

// 存储订单信息的 API
app.post('/api/orders', async (req, res) => {
    try {
        const orderItemIds = req.body.orderItemIds;
        // 在这里，你可以将 orderItemIds 保存到数据库中
        // 将其插入到一个名为 orders 的表中
        const query = 'INSERT INTO orders (item_id) VALUES (?)';
        const result = await db.query(query, [orderItemIds]);

        res.status(200).json({ message: '订单提交成功', orderId: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '订单提交成功' });
    }
});

app.get('/api/orders', (req, res) => {
    db.query('SELECT item_id,created_at FROM orders', (err, results) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(results);
        }
    });
});
// 存储评论信息的 API
app.post('/api/comment', (req, res) => {
    const { itemName, comment } = req.body;
  
    // 在这里，你可以将itemName和comment保存到数据库中
    const query = 'INSERT INTO comments (item_name, comment) VALUES (?, ?)';
    db.query(query, [itemName, comment], (err, results) => {
      if (err) {
        console.error('Error saving comment:', err);
        res.status(500).json({ error: 'Failed to save comment' });
      } else {
        console.log('Comment saved successfully');
        res.status(200).json({ message: 'Comment saved successfully' });
      }
    });
  });
  
app.get('/api/comments/:itemId', (req, res) => {
    const itemId = req.params.itemId;
    db.query('SELECT * FROM comments WHERE item_id = ?', [itemId], (err, results) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(results);
        }
    });
});
app.delete('/api/orders/:item_id', (req, res) => {
    const item_id = req.params.item_id;
    const sql = 'DELETE FROM orders WHERE item_id = ?';
    db.query(sql, [item_id], (err, result) => {
        if (err) {
            console.error('删除订单失败:', err);
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: '订单删除成功' });
    });
});
// 启动服务器
app.listen(port, () => {
    console.log(`服务器正在监听端口 ${port}`);
});
