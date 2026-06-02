 -- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: teen_fashion
-- ------------------------------------------------------
-- Server version	9.7.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '376e4512-4e09-11f1-97fe-040e3cd78864:1-665';

--
-- Table structure for table `addresses`
--

DROP TABLE IF EXISTS `addresses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `addresses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `pincode` varchar(10) DEFAULT NULL,
  `address` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `addresses`
--

LOCK TABLES `addresses` WRITE;
/*!40000 ALTER TABLE `addresses` DISABLE KEYS */;
/*!40000 ALTER TABLE `addresses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cart`
--

DROP TABLE IF EXISTS `cart`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `product_id` int DEFAULT NULL,
  `size` varchar(10) DEFAULT NULL,
  `quantity` int DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart`
--

LOCK TABLES `cart` WRITE;
/*!40000 ALTER TABLE `cart` DISABLE KEYS */;
/*!40000 ALTER TABLE `cart` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` varchar(20) DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `product_name` varchar(255) DEFAULT NULL,
  `product_image` varchar(500) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `size` varchar(10) DEFAULT NULL,
  `quantity` int DEFAULT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `delivery_date` varchar(100) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,'ORD992641',1,'Sharara Weeding Outfit','../images/product14.jpg',1499.00,'S',1,'COD','Tuesday, 26 May','Ordered','2026-05-23 16:27:50'),(2,'ORD341335',1,'Indo Western Dress','../images/product13.jpg',2000.00,'S',1,'COD','Sunday, 31 May','Ordered','2026-05-24 05:03:12');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `old_price` decimal(10,2) DEFAULT NULL,
  `discount` varchar(50) DEFAULT NULL,
  `image` varchar(500) DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `sizes` json DEFAULT NULL,
  `is_featured` tinyint DEFAULT '0',
  `description` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` (id, name, price, image, category, sizes, description) VALUES
(1,'Floral Summer Dress',999,'../images/product1.jpg','dresses','["XS","S","M","L","XL"]','Beautiful floral summer dress perfect for parties, outings and casual wear.'),
(2,'Sharara Weeding Outfit',1499,'../images/product14.jpg','traditional','["XS","S","M","L","XL"]','Elegant sharara set perfect for weddings and special occasions.'),
(3,'Puff Sleeve Top',599,'../images/Product_images/3.jpg','tops','["XS","S","M","L","XL"]','Cute puff sleeve top perfect for a casual day out.'),
(4,'Pleated Skirt co-ord Set',1999,'../images/Trendy3.jpg','dresses','["XS","S","M","L","XL"]','Stylish pleated skirt co-ord set for a chic and trendy look.'),
(5,'Straight fit kurta Set',1299,'../images/product12.jpg','traditional','["XS","S","M","L","XL"]','Classic straight fit kurta set perfect for formal occasions.'),
(6,'Burned orange dress',1299,'../images/Product_images/Burned orange dress.jpg','dresses','["XS","S","M","L","XL"]','Stylish burned orange dress perfect for a casual day out.'),
(7,'Denim Tube Top',1399,'../images/Product_images/11.jpg','tops','["XS","S","M","L","XL"]','Chic denim tube top perfect for a casual day out.'),
(8,'Contrast Co-rd Set',1299,'../images/product3.jpg','dresses','["XS","S","M","L","XL"]','Stylish contrast co-ord set for a modern and trendy look.'),
(9,'Indo Western Dress',2599,'../images/product13.jpg','traditional','["XS","S","M","L","XL"]','Elegant Indo Western dress perfect for a special occasion.'),
(10,'Square Neck Fit Dress',1399,'../images/Trendy4.jpg','dresses','["XS","S","M","L","XL"]','Stylish square neck fit dress perfect for a casual day out.'),
(11,'Casual College Outfit',1299,'../images/product8.jpg','casual','["XS","S","M","L","XL"]','Comfortable casual college outfit perfect for everyday wear.'),
(12,'Indo-western dress',2000,'../images/Product_images/saree1.jpg','traditional','["XS","S","M","L","XL"]','Elegant Indo-western dress perfect for a special occasion.'),
(13,'Floral Summer Dress Vol 2',1499,'../images/product15.jpg','dresses','["XS","S","M","L","XL"]','Elegant floral summer dress with trendy and modern fashion look.'),
(14,'Neck Tank Top',399,'../images/product7.jpg','tops','["XS","S","M","L","XL"]','Comfortable and stylish neck tank top for everyday wear.'),
(15,'Prom Dress',1799,'../images/product16.jpg','dresses','["XS","S","M","L","XL"]','Elegant prom dress for a special occasion.'),
(16,'Casual T-Shirt',999,'../images/college.jpg','tops','["XS","S","M","L","XL"]','Comfortable and stylish casual t-shirt for everyday wear.'),
(17,'Yellow Summer Outfit',999,'../images/product5.jpg','dresses','["XS","S","M","L","XL"]','Stylish yellow summer outfit for a vibrant look.'),
(18,'Pearl Embellished Top',1100,'../images/Product_images/6.jpg','tops','["XS","S","M","L","XL"]','Elegant pearl embellished top for a sophisticated look.'),
(19,'Floral Dress',999,'../images/product9.jpg','dresses','["XS","S","M","L","XL"]','Beautiful floral dress for a charming look.'),
(20,'Pink Peplum Sharara Set',2900,'../images/Product_images/Pink Peplum Sharara Set.jpg','traditional','["XS","S","M","L","XL"]','Elegant pink peplum sharara set for a sophisticated look.'),
(21,'Indo Western Kurta Set',2000,'../images/Product_images/kurta set.jpg','traditional','["XS","S","M","L","XL"]','Elegant Indo Western dress for a sophisticated look.'),
(22,'Yellow Striped Shirt',1210,'../images/Product_images/Pink Striped Shirt for Women.jpg','tops','["XS","S","M","L","XL"]','Stylish yellow striped shirt for a vibrant look.'),
(23,'Wide-Leg Denim Jeans',1150,'../images/Product_images/Wide-Leg Denim Jeans.jpg','casual','["XS","S","M","L","XL"]','Comfortable wide-leg denim jeans with trendy streetwear style.'),
(24,'Traditional Sharara Outfit',3000,'../images/Product_images/Traditional Sharara Outfit.jpg','traditional','["XS","S","M","L","XL"]','Elegant traditional sharara outfit for a sophisticated look.'),
(25,'Elegant Lime Green Sharara Set',1569,'../images/Product_images/Elegant Lime Green Sharara Set.jpg','traditional','["XS","S","M","L","XL"]','Elegant lime green sharara set for a sophisticated look.'),
(26,'Fashion Era Saree',1490,'../images/Product_images/Fashion Era Saree.jpg','traditional','["XS","S","M","L","XL"]','Stylish fashion era saree for a vibrant look.'),
(27,'Camiseta casual T-Shirt',499,'../images/Product_images/Camiseta casual T-Shirt.jpg','tops','["XS","S","M","L","XL"]','Comfortable casual t-shirt for everyday wear.'),
(28,'Pocket Utility Jacket',2999,'../images/Product_images/pocket utility jacket.jpg','casual','["XS","S","M","L","XL"]','Practical pocket utility jacket for everyday wear.'),
(29,'Hooded Sweatshirt',1299,'../images/Product_images/Hooded Sweatshirt.jpg','casual','["XS","S","M","L","XL"]','Comfortable hooded sweatshirt for everyday wear.'),
(30,'Beautiful Pakistani Co-ord Set',1499,'../images/Product_images/Beautiful pakistani co-ord set.jpg','traditional','["XS","S","M","L","XL"]','Beautiful pakistani co-ord set for a vibrant look.'),
(31,'Classy Jeans',1399,'../images/Product_images/classy jeans.png','casual','["XS","S","M","L","XL"]','Stylish classy jeans for a sophisticated look.'),
(32,'Essential Summer Slim-Fit T-Shirt',699,'../images/Product_images/Essential Summer Slim-Fit Collar T-Shirt.jpg','tops','["XS","S","M","L","XL"]','Comfortable essential summer t-shirt for everyday wear.'),
(33,'Stylish Top',1599,'../images/Product_images/5.jpg','tops','["XS","S","M","L","XL"]','Stylish top for a vibrant look.'),
(34,'Elegant Neutral Outfit',1699,'../images/Product_images/Elegant Neutral Outfitt.jpg','dresses','["XS","S","M","L","XL"]','Elegant neutral outfit for a sophisticated look.'),
(35,'Short Shirt for Women',1299,'../images/Product_images/short Shirt for Women.jpg','tops','["XS","S","M","L","XL"]','Comfortable short shirt for women for everyday wear.'),
(36,'Women Polyester Solid Saree',2300,'../images/Product_images/ODETTE Women Polyester Solid Saree.jpg','traditional','["XS","S","M","L","XL"]','Elegant ODETTE women polyester solid saree for a sophisticated look.'),
(37,'Jersey Shirts',990,'../images/Product_images/Jersey Shirts.jpg','casual','["XS","S","M","L","XL"]','Comfortable jersey shirts for everyday wear.'),
(38,'GlowEve Pullover Sweater',1299,'../images/Product_images/GlowEve New Elegant Button Decor Pullover Sweater.jpg','casual','["XS","S","M","L","XL"]','Elegant pullover sweater for a sophisticated look.'),
(39,'White Suit',1599,'../images/Product_images/White Suit.jpg','traditional','["XS","S","M","L","XL"]','Elegant white suit for a sophisticated look.'),
(40,'Traditional Outfits Set',1999,'../images/Product_images/traditional outfits diwali.jpg','traditional','["XS","S","M","L","XL"]','Beautiful traditional outfits set for festive occasions.'),
(41,'Straight Fit Jeans',1299,'../images/Product_images/Straight Fit jeans.png','casual','["XS","S","M","L","XL"]','Comfortable straight fit jeans for everyday wear.'),
(42,'Lavender Suit',1499,'../images/Product_images/lavender suit.jpg','traditional','["XS","S","M","L","XL"]','Elegant lavender suit for a sophisticated look.'),
(43,'Long Sleeve Chunky Knit Sweater',1199,'../images/Product_images/Long Sleeve Chunky Knit Sweater.jpg','casual','["XS","S","M","L","XL"]','Comfortable long sleeve chunky knit sweater for everyday wear.'),
(44,'Korean Drama Jacket',1679,'../images/Product_images/Korean drama jacket.jpg','casual','["XS","S","M","L","XL"]','Stylish korean drama jacket for a trendy look.'),
(45,'Pink Shirt',999,'../images/Product_images/Pink shirt.jpg','casual','["XS","S","M","L","XL"]','Comfortable pink shirt for everyday wear.'),
(46,'Trendy Brand Bow Hooded',1499,'../images/Product_images/Trendy Brand Bow Hooded.jpg','casual','["XS","S","M","L","XL"]','Stylish trendy brand bow hooded for a fashionable look.'),
(47,'Women White Brown T-Shirt',1700,'../images/Product_images/women white brown tshirt.jpg','tops','["XS","S","M","L","XL"]','Comfortable women white brown tshirt for everyday wear.'),
(48,'Flora Print Co-ord Set',2400,'../images/Product_images/letast Flora print co-ord set.jpg','dresses','["XS","S","M","L","XL"]','Stylish flora print co-ord set for a fashionable look.'),
(49,'Short-Sleeve Polo Shirt',799,'../images/Product_images/Short-Sleeve Polo Shirt.jpg','casual','["XS","S","M","L","XL"]','Comfortable short-sleeve polo shirt for everyday wear.'),
(50,'Lambskin Leather Jacket',1899,'../images/Product_images/Lambskin Leather Jacket For Womens.jpg','casual','["XS","S","M","L","XL"]','Stylish lambskin leather jacket for women.'),
(51,'Traditional Saree',1599,'../images/Product_images/Traditional Saree.jpg','traditional','["XS","S","M","L","XL"]','Elegant traditional saree for special occasions.'),
(52,'Short Top',999,'../images/Product_images/12.jpg','tops','["XS","S","M","L","XL"]','Comfortable short top for everyday wear.'),
(53,'High Waist Wide Leg Baggy Jeans',1299,'../images/Product_images/High Waist Wide Leg Baggy Jeans.jpg','casual','["XS","S","M","L","XL"]','Stylish high waist wide leg baggy jeans for a fashionable look.'),
(54,'Girls Fuzzy Trim Hooded',1999,'../images/Product_images/Girls Fuzzy Trim Hooded.jpg','casual','["XS","S","M","L","XL"]','Stylish girls fuzzy trim hooded for a fashionable look.'),
(55,'Denim Top',1299,'../images/Product_images/4.jpg','tops','["XS","S","M","L","XL"]','Stylish denim top for a fashionable look.'),
(56,'Fashion Attire Gown',2499,'../images/Product_images/Fashion Attire Gown.jpg','dresses','["XS","S","M","L","XL"]','Elegant fashion attire gown for special occasions.'),
(57,'Lavender Floral Wrap Top',1299,'../images/Product_images/Lavender Floral Wrap Top.jpg','tops','["XS","S","M","L","XL"]','Stylish lavender floral wrap top for a fashionable look.'),
(58,'Mint Green Saree Look',1899,'../images/Product_images/14.jpg','traditional','["XS","S","M","L","XL"]','Stylish mint green saree look for a fashionable look.'),
(59,'Co-ord Set for Summer',1546,'../images/Product_images/Co-ord set for summer.jpg','dresses','["XS","S","M","L","XL"]','Stylish co-ord set for summer for a fashionable look.'),
(60,'Purple Tulle Beaded Prom Dress',2399,'../images/Product_images/Purple Tulle Beaded Long Prom Dress.jpg','dresses','["XS","S","M","L","XL"]','Elegant purple tulle beaded long prom dress for special occasions.');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subscribers`
--

DROP TABLE IF EXISTS `subscribers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subscribers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subscribers`
--

LOCK TABLES `subscribers` WRITE;
/*!40000 ALTER TABLE `subscribers` DISABLE KEYS */;
INSERT INTO `subscribers` VALUES (1,'kambojprachi68@gmail.com','2026-05-24 05:05:00'),(2,'prachikamboj247@gmail.com','2026-05-24 05:06:51');
/*!40000 ALTER TABLE `subscribers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;



CREATE TABLE password_resets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Prachi Kamboj','prachikamboj768@gmail.com','$2b$12$lHGQR1oZq0Nm3oXaVODPCemIzSXUzsrTzUbvUNxiDmdBiogbMn/yO','2026-05-23 16:27:23');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;


--
-- Table structure for table `wishlist`
--

DROP TABLE IF EXISTS `wishlist`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wishlist` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `product_id` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wishlist`
--

LOCK TABLES `wishlist` WRITE;
/*!40000 ALTER TABLE `wishlist` DISABLE KEYS */;
/*!40000 ALTER TABLE `wishlist` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-24 10:46:10
USE teen_fashion;

CREATE TABLE contacts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
