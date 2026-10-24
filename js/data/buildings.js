// DANH MỤC CÔNG TRÌNH (theo file thiết kế). Hiện vẽ bằng khối màu; sau này thêm trường img:'assets/...png' là thay được.
// Vật liệu: G gỗ, Đ đá, Ga gạch, Ng ngói, S sắt, V vải, T tiền.
Game.groups = [['road','Đường'],['house','Nhà ở'],['farm','Nông nghiệp'],['prod','Sản xuất'],['store','Kho & nước'],['shop','Thương mại'],['civic','Dịch vụ'],['army','Quân sự']];
Game.buildingDefs = {};
(function () {
  // B(id, tên, nhóm, rộng, dài, cao, màu, chi phí, nhân công, độ dễ cháy 0-5, vai trò, phạm vi)
  const B = (id, name, g, w, h, z, c, cost, jobs, flam, role, range) =>
    Game.buildingDefs[id] = { id, name, g, w, h, z, c, cost, jobs, flam, role, range };
  B('road','Đường đất','road',1,1,2,'#a58a5e',{G:1},0,0);
  B('house1','Nhà gỗ cấp 1','house',1,1,24,'#b08a5a',{G:10},0,4);
  B('house2','Nhà nông cấp 2','house',1,1,28,'#a8794a',{G:15,'Đ':4,Ga:4},0,3);
  B('house3','Nhà ngói','house',2,2,34,'#c9b48a',{G:20,'Đ':5,Ga:8,Ng:6},0,2);
  B('court','Nhà sân trong','house',2,2,38,'#d8c9a3',{G:30,'Đ':12,Ga:12,Ng:10},0,2);
  B('hostel','Khách điếm','house',2,2,38,'#c47a4a',{G:25,'Đ':10,Ga:8,Ng:4},4,3);
  B('field','Ruộng lúa','farm',2,2,3,'#c8b94a',{},2,1);
  B('veg','Vườn rau','farm',1,1,3,'#6aa84f',{},1,1);
  B('ranch','Trại chăn nuôi','farm',2,2,24,'#9c7a52',{G:20,'Đ':8,Ga:6},4,3);
  B('lumber','Nhà đốn gỗ','prod',2,2,26,'#8a6a3a',{G:15,'Đ':6},3,4);
  B('quarry','Mỏ đá','prod',2,2,16,'#9a9a9a',{G:15,'Đ':12,S:3},4,1);
  B('kiln','Lò gạch','prod',2,2,28,'#b5533c',{G:15,'Đ':8,S:3},3,5);
  B('sawmill','Xưởng cưa','prod',2,2,28,'#a9894f',{G:18,'Đ':8,S:3},3,4);
  B('mill','Cối xay bột','prod',2,2,32,'#d6c49a',{G:18,'Đ':8,S:4},3,3);
  B('smelter','Xưởng luyện kim','prod',2,2,30,'#6b4a44',{G:20,'Đ':10,Ga:4,S:4},3,5);
  B('store1','Kho nhỏ','store',2,2,26,'#8d7b5f',{G:12,'Đ':6,Ga:4},2,2,'store');
  B('store2','Kho lớn','store',3,3,32,'#7c6a50',{G:30,'Đ':20,Ga:12,S:6},4,2,'store');
  B('well','Giếng thường','store',1,1,10,'#7f9aa8',{G:8,'Đ':8},1,0,'well',6);
  B('well2','Giếng lớn','store',1,1,12,'#6f8fa0',{G:16,'Đ':16,Ga:4},2,0,'well',8);
  B('watch','Tháp quan sát hỏa hoạn','store',1,1,54,'#a07a4a',{G:12,'Đ':12,S:3},2,2,'watch',12);
  B('firest','Trạm cứu hỏa','store',2,2,34,'#b0382a',{G:20,'Đ':20,S:6},4,1,'fire',14);
  B('market','Chợ','shop',3,3,26,'#d9a441',{G:20,'Đ':12,Ga:8},4,3);
  B('tea','Trà quán','shop',2,2,34,'#9a6b4b',{G:20,'Đ':8,Ng:8},3,3);
  B('tavern','Tửu lầu','shop',2,2,44,'#b04a3a',{G:25,'Đ':12,Ng:10},5,4);
  B('yamen','Nha môn','civic',3,3,40,'#7a3a2a',{G:25,'Đ':20,Ga:10,S:5},4,2);
  B('school','Trường học','civic',2,2,34,'#c9b078',{G:20,'Đ':15,Ng:10},4,2);
  B('clinic','Cơ sở chữa bệnh','civic',2,2,34,'#cfd8c0',{G:35,'Đ':20,Ga:15,S:5},6,2);
  B('police','Trạm trị an','civic',2,2,32,'#4a5a7a',{G:18,'Đ':12,Ga:6},3,2);
  B('temple','Chùa','civic',2,2,44,'#c8553a',{G:25,'Đ':15,Ng:10},3,3);
  B('barracks','Doanh trại','army',3,3,32,'#6a6a58',{G:30,'Đ':20,Ga:10,S:5},4,2);
  B('archer','Tháp bắn cung','army',1,1,50,'#8a7a62',{G:15,'Đ':20,S:6},3,2);
  B('wall','Tường thành','army',1,1,20,'#a8a08c',{'Đ':3,Ga:1},0,0);
  B('claymine','Mỏ đất sét','prod',2,2,16,'#a0704a',{G:12,'Đ':6},3,1);
  B('ironmine','Mỏ sắt','prod',2,2,16,'#5a5a66',{G:20,'Đ':15,S:4},4,1);
})();
