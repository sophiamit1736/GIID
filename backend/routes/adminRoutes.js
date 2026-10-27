const express=require('express'); const router=express.Router(); const {verifyToken,authorizeRoles}=require('../middleware/authMiddleware'); const c=require('../controllers/adminController');
router.use(verifyToken,authorizeRoles('admin'));
router.get('/dashboard',c.dashboard); router.get('/users',c.listUsers); router.post('/users',c.createUser); router.put('/users/:id',c.updateUser); router.delete('/users/:id',c.deleteUser); module.exports=router;
