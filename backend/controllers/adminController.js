const User = require('../models/User');
const Student = require('../models/Student');
const ActivityResult = require('../models/ActivityResult');
const LearningModule = require('../models/LearningModule');
const bcrypt = require('bcrypt');

const dashboard = async (req,res)=>{
 try{
  const [users,students,modules,results] = await Promise.all([
   User.countDocuments(), Student.countDocuments({status:'Active'}), LearningModule.countDocuments({status:'Active'}), ActivityResult.countDocuments()
  ]);
  const roles = await User.aggregate([{ $group:{_id:'$role',count:{$sum:1}} }]);
  const recentUsers = await User.find().select('name email role status createdAt').sort({createdAt:-1}).limit(20).lean();
  res.json({users,students,modules,results,roles,recentUsers});
 }catch(e){res.status(500).json({message:e.message});}
};
const listUsers = async (req,res)=>{ try{res.json(await User.find().select('-password').sort({createdAt:-1}).lean());}catch(e){res.status(500).json({message:e.message});} };
const createUser = async (req,res)=>{ try{const {name,email,password,role='teacher'}=req.body||{}; if(!name||!email||!password) return res.status(400).json({message:'name, email and password are required'}); if(!['admin','teacher'].includes(role)) return res.status(400).json({message:'Invalid role'}); const exists=await User.findOne({email:email.trim().toLowerCase()}); if(exists)return res.status(409).json({message:'Email already exists'}); const user=await User.create({name:name.trim(),email:email.trim().toLowerCase(),password:await bcrypt.hash(password,10),role}); res.status(201).json({user:{id:user._id,name:user.name,email:user.email,role:user.role,status:user.status}});}catch(e){res.status(400).json({message:e.message});} };
const updateUser = async (req,res)=>{ try{const body={}; if(req.body.name)body.name=req.body.name.trim(); if(req.body.email)body.email=req.body.email.trim().toLowerCase(); if(req.body.role&&['admin','teacher'].includes(req.body.role))body.role=req.body.role; if(req.body.status)body.status=req.body.status; if(req.body.password)body.password=await bcrypt.hash(req.body.password,10); const user=await User.findByIdAndUpdate(req.params.id,body,{new:true,runValidators:true}).select('-password'); if(!user)return res.status(404).json({message:'User not found'}); res.json(user);}catch(e){res.status(400).json({message:e.message});} };
const deleteUser = async(req,res)=>{try{if(String(req.params.id)===String(req.user.id))return res.status(400).json({message:'You cannot delete your own account.'}); const u=await User.findByIdAndDelete(req.params.id); if(!u)return res.status(404).json({message:'User not found'});res.json({message:'User deleted'});}catch(e){res.status(500).json({message:e.message});}};
module.exports={dashboard,listUsers,createUser,updateUser,deleteUser};
