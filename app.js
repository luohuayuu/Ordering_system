const mysql = require('mysql2');
const express = require('express');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');
const cors = require('cors');
app.use(bodyParser.json());
app.use(cors());

// 创建一个数据库连接配置对象
const connection = mysql.createConnection({
  host: '139.159.202.66', // 数据库服务器地址
  port: 3306, // 数据库端口
  user: 'root', // 数据库用户名
  password: '123456', // 数据库密码
  database: 'ruangong' // 要连接的数据库名
});

// // 创建一个数据库连接配置对象
// const connection = mysql.createConnection({
//   host: 'localhost', // 数据库服务器地址
//   port: 3306, // 数据库端口
//   user: 'root', // 数据库用户名
//   password: '', // 数据库密码
//   database: 'web' // 要连接的数据库名
// });

// 连接到数据库
connection.connect((err) => {
  if (err) {
    console.error('数据库连接失败:', err);
    if (err.code === 'ECONNREFUSED') {
      console.error('数据库连接被拒绝，请检查数据库服务是否启动或端口是否正确。');
    } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('数据库访问被拒绝，请检查用户名和密码是否正确。');
    } else {
      console.error('其他数据库连接错误:', err.message);
    }
    return;
  }
  console.log('MySQL 数据库已连接');
});

// 添加 usercheck 路由
app.post('/usercheck', (req, res) => {
  const { username, password } = req.body;
  const sql = 'SELECT * FROM users WHERE username = ? AND password = ?';
  connection.query(sql, [username, password], (err, results) => {
    if (err) {
      console.error('检查账号合法性失败:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    if (results.length > 0) {
      res.json({ success: true, message: '账号合法' });
    } else {
      res.json({ success: false, message: '账号不合法' });
    }
  });
});

app.post('/rootusercheck', (req, res) => {
  const { username, password } = req.body;
  const sql = 'SELECT * FROM manusers WHERE username = ? AND password = ?';
  connection.query(sql, [username, password], (err, results) => {
    if (err) {
      console.error('检查账号合法性失败:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    if (results.length > 0) {
      res.json({ success: true, message: '账号合法' });
    } else {
      res.json({ success: false, message: '账号不合法' });
    }
  });
});


app.get('/userInfo', (req, res) => {
  // 从数据库中获取用户信息
  const sql = 'SELECT * FROM users';
  connection.query(sql, (err, results) => {
    if (err) {
      console.error('获取用户信息失败:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(results);
  });
});

// 获取学生信息路由******************************
app.get('/getstumessage', (req, res) => {
  const sql = 'SELECT * FROM users'; // 假设学生信息存储在名为 students 的表中
  connection.query(sql, (err, results) => {
    if (err) {
      console.error('获取学生信息失败:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(results);
  });
});

// 获取菜品信息的路由
app.get('/getdishmessage', (req, res) => {
  const query = 'SELECT * FROM menu';
  connection.query(query, (error, results) => {
    if (error) {
      console.error('获取菜品信息失败:', error);
      res.status(500).send('获取菜品信息失败');
      return;
    }
    res.json(results);
  });
});

// 获取评论信息的路由
app.get('/getcommentmessage', (req, res) => {
  const query = 'SELECT * FROM comments';
  connection.query(query, (error, results) => {
    if (error) {
      console.error('获取评论信息失败:', error);
      res.status(500).send('获取评论信息失败');
      return;
    }
    res.json(results);
  })
});

// 添加 新学生 路由*****************************************
app.post('/newstumessage', (req, res) => {
  const { name, gender, class: studentClass, studentId, idNumber, phone, username, password } = req.body;

  // 假设我们需要检查学生信息是否完整
  if (!name || !gender || !studentClass || !studentId || !idNumber || !phone || !username || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // 构造插入数据的 SQL 语句
  const sql = 'INSERT INTO users (name, gender, class, studentid, idnumber, phone, username, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
  const values = [name, gender, studentClass, studentId, idNumber, phone, username, password];

  // 执行插入操作
  connection.query(sql, values, (err, results) => {
    if (err) {
      console.error('添加学生信息失败:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(201).json({ message: 'Student added successfully', studentId: results.insertId });
  });
});

// 添加 新菜品 路由
app.post('/newdishmessage', (req, res) => {
  const { name, dishId, cuisine, price, image } = req.body;

  // 构造插入数据的 SQL 语句
  const sql = 'INSERT INTO menu (name, id, cuisine, price, image ) VALUES (?, ?, ?, ?, ?)';
  const values = [name, dishId, cuisine, price, image];

  // 执行插入操作
  connection.query(sql, values, (err, results) => {
    if (err) {
      console.error('添加菜品信息失败:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(201).json({ message: 'Dish added successfully', dishId: results.insertId });
  });
});

// 更新学生信息的路由**********************************************
app.put('/updatestumessage', (req, res) => {
  const { name, gender, class: studentClass, studentId, idNumber, phone, username, password } = req.body;
  //console.log(class);
  if (!studentId) {
    return res.status(400).json({ error: 'Missing studentId' });
  }

  const sql = 'UPDATE users SET name = ?, gender = ?, class = ?,studentId = ?, idnumber = ?, phone = ?, username = ?, password = ? WHERE studentId = ?';
  const values = [name, gender, studentClass, studentId, idNumber, phone, username, password, studentId];
  //console.log(req.body);
  connection.query(sql, values, (err, results) => {
    if (err) {
      console.error('更新失败:', err);
      return res.status(500).json({ error: err.message });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.status(200).json({ message: 'Student updated successfully' });
  });
});

//更新菜品信息的路由
app.put('/updatedishmessage', (req, res) => {
  const { name, dishId, cuisine, price, image } = req.body;

  const sql = 'UPDATE menu SET name = ?, id = ?, cuisine = ?,price = ?, image = ? WHERE id = ?';
  const values = [name, dishId, cuisine, price, image, dishId];
  //console.log(req.body);
  connection.query(sql, values, (err, results) => {
    if (err) {
      console.error('更新失败:', err);
      return res.status(500).json({ error: err.message });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Dish not found' });
    }

    res.status(200).json({ message: 'Dish updated successfully' });
  });
});
// 删除学生信息的路由*************************************
app.delete('/deletestumessage/:studentId', (req, res) => {
  const studentId = req.params.studentId;

  if (!studentId) {
    return res.status(400).json({ error: 'Missing studentId' });
  }

  const sql = 'DELETE FROM users WHERE studentId = ?';
  const values = [studentId];

  connection.query(sql, values, (err, results) => {
    if (err) {
      console.error('删除失败:', err);
      return res.status(500).json({ error: err.message });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'student not found' });
    }

    res.status(200).json({ message: 'student deleted successfully' });
  });
});

// 删除评论的路由
app.delete('/deletecomment', (req, res) => {
  const commentId = req.body.commentId;
  const query = 'DELETE FROM comments WHERE id = ?';
  connection.query(query, [commentId], (error, results) => {
    if (error) {
      console.error('删除评论失败:', error);
      res.status(500).send('删除评论失败');
      return;
    }
    res.status(200).send('评论已删除');
  });
});

// 删除菜品信息的路由
app.delete('/deletedishmessage/:dishId', (req, res) => {
  const dishId = req.params.dishId;

  if (!dishId) {
    return res.status(400).json({ error: 'Missing dishId' });
  }

  const sql = 'DELETE FROM menu WHERE id = ?';
  const values = [dishId];

  connection.query(sql, values, (err, results) => {
    if (err) {
      console.error('删除失败:', err);
      return res.status(500).json({ error: err.message });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'dish not found' });
    }

    res.status(200).json({ message: 'Dish deleted successfully' });
  });
});

//******************************* */
app.get('/countorderStrings/:str/:id', (req, res) => {
  const strr = req.params.str;
  const idd = req.params.id; // 获取 id 参数
  // console.log(strr);
  // console.log(idd);

  if (!strr || !idd) {
    return res.status(400).json({ error: 'Missing string or id parameter' });
  }

  const sql = 'SELECT COUNT(*) AS count FROM orders WHERE times = ? AND item_id = ?';
  const values = [strr, idd];

  connection.query(sql, values, (err, results) => {
    if (err) {
      console.error('查询失败:', err);
      return res.status(500).json({ error: err.message });
    }

    const count = results[0].count; // 获取计数结果
    console.log(count);
    res.status(200).json({ count: count });
  });
});

//另一份node.js代码



// 提交投诉与建议的 API
app.post('/submit-feedback', (req, res) => {
  const { name, email, message } = req.body;

  // 插入数据到数据库
  const query = 'INSERT INTO feedbacks (name, email, message) VALUES (?, ?, ?)';
  connection.query(query, [name, email, message], (err, result) => {
    if (err) {
      console.error('数据库插入失败:', err);
      res.status(500).send('提交失败，请稍后再试。');
    } else {
      res.send('感谢您的反馈，您的投诉与建议已提交！');
    }
  });
});

// 存储订单信息的 API
app.post('/api/orders', async (req, res) => {
  const { orderItemIds, orderItemNames, expectedTime, studentId } = req.body;

  const query = 'INSERT INTO orders (item_id,item_name,times,user_id) VALUES (?, ?,?,?)';
  connection.query(query, [orderItemIds, orderItemNames, expectedTime, studentId], (err, results) => {
    if (err) {
      console.error('Error saving order:', err);
      res.status(500).json({ error: '订单提交失败' });
    } else {
      console.log('订单提交成功');
      res.status(200).json({ message: '订单提交成功' });
    }
  });
});


// 存储评论信息的 API
app.post('/api/comment', (req, res) => {
  const { itemName, comment } = req.body;
  const query = 'INSERT INTO comments (item_name, comment) VALUES (?, ?)';
  connection.query(query, [itemName, comment], (err, results) => {
    if (err) {
      console.error('Error saving comment:', err);
      res.status(500).json({ error: 'Failed to save comment' });
    } else {
      console.log('Comment saved successfully');
      res.status(200).json({ message: 'Comment saved successfully' });
    }
  });
});


app.delete('/api/orders/:id', (req, res) => {
  const id = req.params.id;
  const sql = 'DELETE FROM orders WHERE id = ?';
  connection.query(sql, [id], (err, result) => {
    if (err) {
      console.error('删除订单失败:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: '订单删除成功' });
  });
});

// 获取菜品信息的 API
app.get('/api/menu', (req, res) => {
  connection.query('SELECT id, name, cuisine, price, image,comment FROM menu', (err, results) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(results);
    }
  });
});

app.get('/api/comments/:itemId', (req, res) => {
  const itemId = req.params.itemId;
  connection.query('SELECT * FROM comments WHERE item_id = ?', [itemId], (err, results) => {
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
  connection.query(sql, [item_id], (err, result) => {
    if (err) {
      console.error('删除订单失败:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: '订单删除成功' });
  });
});


// 获取学生姓名的路由
app.get('/getstumessage/:studentId', (req, res) => {
  const studentId = req.params.studentId; // 获取 URL 参数中的 studentId
  const sql = 'SELECT * FROM users WHERE studentId=?'; // 假设学生信息存储在名为 users 的表中
  const values = [studentId];

  connection.query(sql, values, (err, results) => {
    if (err) {
      console.error('通过id查询失败:', err);
      return res.status(500).json({ error: err.message });
    }

    if (results.length === 0) { // 检查查询结果是否为空
      return res.status(404).json({ error: 'Student not found' });
    }

    res.status(200).json(results[0]); // 返回查询到的学生信息
  });
});

// 提交投诉与建议的 API
app.post('/submit-feedback', (req, res) => {
  const { name, email, message } = req.body;

  const query = 'INSERT INTO feedbacks (name, email, message) VALUES (?, ?, ?)';
  connection.query(query, [name, email, message], (err, result) => {
    if (err) {
      console.error('数据库插入失败:', err);
      res.status(500).send('提交失败，请稍后再试。');
    } else {
      res.send('感谢您的反馈，您的投诉与建议已提交！');
    }
  });
});

app.listen(port, () => {
  console.log(`服务器正在监听端口 ${port}`);
});