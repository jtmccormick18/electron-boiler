const db = require("../models");
// const jwt = require('jsonwebtoken');
// const authentication = require('../middleware/authentication');
const fs = require('fs');
require('dotenv').config();
const path = require('path');
var shapefile = require("shapefile");
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fileExists = require('file-exists');
const shp = require('shpjs');
var multer = require("multer");
var Unzipper = require("decompress-zip");

const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const gis_dest = multer({ dest: 'assets/gis/' }).single('zipFile');


const storeData = (data, path, errorMessage) => {
    try {
        fs.writeFileSync(path, JSON.stringify(data))
    } catch (err) {
        console.error(errorMessage || (err))
    }
}

const gisZipPath = path.join(process.cwd(), '/public/assets/gis/gis.zip');
const gisFolderPath = path.join(process.cwd(), '/public/assets/gis/');
const gisJsonPath = path.join(process.cwd(), '/public/assets/gis/gis.json');

module.exports = function (app) {
    app.get('/api/parcels/:parno', function (req, res) {
        db.sequelize.query(`select rtrim(parcel_no) as PID,REALKEY from REALPROP where PARCEL_NO like '%${req.params.parno}%';`)
            .then(parcels => {
                res.json(parcels);
            })
            .catch(err => {
                res.err({ err })
            })
    })
    app.get('/api/pins', function (req, res) {
        db.sequelize.query(`select rtrim(parcel_no) as PID,REALPROP.REALKEY as REALKEY from REALPROP left join LANDSUBS on REALPROP.REALKEY=LANDSUBS.REALKEY left join REPROP on REALPROP.REALKEY=REPROP.REALKEY where REALPROP.DIGCLASS='R' and SUB_TYPE='RES' and HEATEDAREA > 0;`)
            .then(parcels => {
                res.json(parcels);
            })
            .catch(err => {
                res.json({ err })
            })
    })
    app.get('/api/pins/gis', function (req, res) {
        const adapter = new FileSync(gisJsonPath)
        const db = low(adapter)
        const parcels = db.get('features')
            .map('id')
            .value()
        const size = db.get('features')
            .size()
            .value()
        return res.json({ parcels, size });
    })
    app.get('/image/:id', function (req, res) {
        const basePath = process.env.image_path;
        const id = req.params.id;
        const imgPath = `C://Temp/pics/${id}/${id}.png`;
        if (fs.existsSync(imgPath)) {
            // Do something
            res.sendFile(imgPath);
        }
        else {
            res.sendFile(path.join(__dirname, '../public', 'logo.png'))
        }
    })


    app.get('/test', function (req, res) {
        if (process.env.DB_TYPE === 'microsoft') {
            db.sequelize.query(`select top(10) rtrim(parcel_no) as PIN, REALPROP.REALKEY AS REALKEY, TOTALACRES, SUBD_NAME, NEIGHBHOOD, SUBDIVCODE, DESCRIP, HEATEDAREA from REALPROP left join LANDSUBS on REALPROP.realkey = LANDSUBS.realkey LEFT JOIN REPROP on REPROP.realkey = REALPROP.realkey and neighbhood is not null; `)
                .then(parcels => {
                    return res.json(parcels);
                })
                .catch(err => {
                    return res.json({ err });
                })
        }
        else {
            db.sequelize.query(`select rtrim(parcel_no) as PIN, REALPROP.REALKEY AS REALKEY, TOTALACRES, SUBD_NAME, NEIGHBHOOD, SUBDIVCODE, DESCRIP, HEATEDAREA from REALPROP left join LANDSUBS on REALPROP.realkey = LANDSUBS.realkey LEFT JOIN REPROP on REPROP.realkey = REALPROP.realkey and neighbhood is not null limit 10; `)
                .then(parcels => {
                    return res.json(parcels);
                })
                .catch(err => {
                    return res.json({ err });
                })
        }

    })

    app.get('/api/comps-for/:subject', function (req, res) {
        let parcelData;
        let comps;
        // const hasWhiteSpace = function (s) {
        //     return s.indexOf(' ') >= 0;
        // };
        // let storyMatch = req.params.matchStories;
        // if (storyMatch) {
        //     db.sequelize.query(`select REALPROP.realkey as realkey, REALPROP.parcel_no as parcel_no, curr_val, neighbhood, heatedarea, yr_built, efyr_built, subd_name, sqb_area, sqb_fin, grade, descripton, stht_code from REALPROP left join REPROP on REALPROP.realkey = REPROP.realkey left join NEIGHBOR on REALPROP.neighbhood = NEIGHBOR.neigh where ${ hasWhiteSpace(req.params.parcel) ? `REALPROP.parcel_no like '${req.params.parcel}%';` : `REALPROP.realkey=${parseInt(req.params.parcel)}` } `)
        //         .then(data => {
        //             console.log(data)
        //             parcelData = data[0][0];
        //             console.log(parcelData)
        //             db.sequelize.query(`select distinct REALPROP.realkey as realkey, REALPROP.parcel_no as parcel_no, curr_val, neighbhood, heatedarea, occupancy, grade, stht_code,
        //     ABS(heatedarea - ${parcelData.heatedarea}) as heatedDifference,yr_built,efyr_built,yr_built-${parcelData.yr_built} as yr_difference,subd_name,
        //     CAST(SALEDATE AS DATE) AS SALEDATE,NET_SP as SalePrice,Reason,
        //     sqb_area,sqb_fin from REALPROP left join REPROP on REALPROP.realkey=REPROP.realkey left join SALEINFO on REALPROP.realkey=SALEINFO.realkey
        //     where SALEINFO.realkey>1 and (year(CURDATE()) -year(SALEDATE))<=2  and SALEINFO.reason in ('FM','LM') and ABS(grade-${parcelData.grade})<=.20 and
        //     REALPROP.neighbhood like '${parcelData.neighbhood.toString().slice(0, 3)}%' and REPROP.stht_code=${parcelData.stht_code} and
        //     ((yr_built <=year(CURDATE())-50 AND ABS(yr_built-${parcelData.yr_built})<=50)
        //     OR (yr_built<=year(CURDATE())-20 and yr_built>=year(CURDATE())-50 AND ABS(yr_built-${parcelData.yr_built})<=20)
        //     OR (yr_built>=year(CURDATE())-20 and yr_built<=year(CURDATE())-10 AND ABS(yr_built-${parcelData.yr_built})<=10)
        //     OR (yr_built>=year(CURDATE())-10 and yr_built<=year(CURDATE()) AND ABS(yr_built-${parcelData.yr_built})<=10))
        //     order by 
        //     CASE WHEN REALPROP.neighbhood='223002'  AND (year(CURDATE())-year(SALEDATE))<=1 THEN REALPROP.neighbhood END desc, 
        //     CASE WHEN REALPROP.subd_name='${parcelData.subd_name}' THEN REALPROP.subd_name END desc,
        //     heatedDifference,
        //     yr_difference,
        //     saledate
        //     LIMIT 10;`)
        //                 .then(compData => {
        //                     comps = compData[0];
        //                     return res.json(
        //                         {
        //                             parcelInfo: parcelData,
        //                             comparables: comps
        //                         }
        //                     )
        //                 })
        //                 .catch(err => {
        //                     res.json({ err: err });
        //                 })
        //         })
        // }
        // else {
        db.sequelize.query(`select REALPROP.realkey as realkey,REALPROP.parcel_no as parcel_no,curr_val,neighbhood,heatedarea,yr_built,efyr_built,subd_name,sqb_area,sqb_fin,grade,descripton,stht_code from REALPROP left join REPROP on REALPROP.realkey=REPROP.realkey left join NEIGHBOR on REALPROP.neighbhood=NEIGHBOR.neigh where REALPROP.realkey=${parseInt(req.params.subject)};`)
            .then(data => {
                console.log(data);
                parcelData = data[0][0];
                db.sequelize.query(`select distinct REALPROP.realkey as realkey,rtrim(REALPROP.parcel_no) as PID,curr_val,neighbhood,heatedarea,occupancy,grade,stht_code,
            ABS(heatedarea - ${parcelData.heatedarea}) as heatedDifference,yr_built,efyr_built,yr_built-${parcelData.yr_built} as yr_difference,SUBD_NAME,TOTALACRES,
            CAST(SALEDATE AS DATE) AS SALEDATE,NET_SP as SalePrice,Reason,
            sqb_area,sqb_fin from REALPROP left join REPROP on REALPROP.realkey=REPROP.realkey left join SALEINFO on REALPROP.realkey=SALEINFO.realkey
            where ABS(grade-${parcelData.grade})<=.50 and
            ((yr_built <=year(CURDATE())-50 AND ABS(yr_built-${parcelData.yr_built})<=50)
            OR (yr_built<=year(CURDATE())-20 and yr_built>=year(CURDATE())-50 AND ABS(yr_built-${parcelData.yr_built})<=20)
            OR (yr_built>=year(CURDATE())-20 and yr_built<=year(CURDATE())-20 AND ABS(yr_built-${parcelData.yr_built})<=20)
            OR (yr_built>=year(CURDATE())-10 and yr_built<=year(CURDATE()) AND ABS(yr_built-${parcelData.yr_built})<=10))
            order by
            heatedDifference,
            yr_difference,
            saledate
            LIMIT 10;`)
                    .then(compData => {
                        console.log(compData)
                        comps = compData[0];
                        return res.json(
                            {
                                parcelInfo: parcelData,
                                comparables: comps
                            }
                        )
                    })
                    .catch(err => {
                        res.json({ err: err });
                    })
            })
        // }
    })

    app.post('/upload/gis-upload', gis_dest, function (req, res) {
        console.log(req.file || req.files);
        // console.log(req.files);
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).send('No files were uploaded.');
        }



        let layer = req.files.file;

        // Use the mv() method to place the file somewhere on your server
        // let moved;
        layer.mv(path.join(process.cwd(), '/public/assets/gis/gis.zip'), function (err) {
            if (err) {
                return res.status(500).send('Cannot Move the parcel layer');
            }
        });


        var filepath = path.join(path.join(process.cwd(), '/public/assets/gis/gis.zip'));
        var unzipper = new Unzipper(filepath);





        unzipper.on("extract", function () {
            console.log("Finished extracting");
            fs.readdirSync(gisFolderPath).forEach(file => {
                fs.renameSync(path.join(process.cwd(), '/public/assets/gis/', file), path.join(process.cwd(), '/public/assets/gis/', 'gis' + path.extname(file)))
            })
            // shapefile.read(path.join(process.cwd(), '/public/assets/gis/gis.shp'), path.join(process.cwd(), '/public/assets/gis/gis.dbf'))
            //     .then(layer => {
            //         fs.writeFile(gisJsonPath, layer, function (err) {
            //             if (err) {
            //                 return res.status(500).send({
            //                     error: err,
            //                     message: 'Cannot create GeoJSON from parcel layer.'
            //                 });
            //             }
            //             return res.status(204).end();
            //         });
            //     });
            const adapter = new FileSync(gisJsonPath)
            const db = low(adapter)
            db.defaults({ features: [] }).write();
            shapefile.open(path.join(process.cwd(), '/public/assets/gis/gis.shp'), path.join(process.cwd(), '/public/assets/gis/gis.dbf'))
                .then(source => source.read()
                    .then(function log(result) {
                        if (result.done) {
                            // fs.readFile(gisJsonPath,function(err,data){
                            //     if(err) return res.status(500).send('Cannot Move the parcel layer');
                            //     const properties=Object.keys(data)
                            //     return res.status(204).json(properties[0]);
                            // })
                            return res.status(204).json();
                        }
                        // fs.appendFile(gisJsonPath, JSON.stringify(result.value), function (err) {
                        //     if (err) throw err;
                        //     // console.log('The "data to append" was appended to file!');
                        // });

                        const { properties, geometry } = result.value;
                        const { realkey, PID, LRSN, PARCEL_NO } = properties;
                        const getDefined = function () {
                            if (realkey) {
                                return realkey;
                            }
                            if (LRSN) {
                                return LRSN;
                            }
                            if (PID) {
                                return PID;
                            }
                            if (PARCEL_NO) {
                                return PARCEL_NO;
                            }
                            else {
                                return 'ID Not Defined'
                            }
                        }
                        db.get('features')
                            .push(
                                {
                                    id: getDefined(),
                                    properties,
                                    geometry
                                }
                            )
                            .write()
                        return source.read().then(log);
                    })).catch(error => {
                        return res.status(500).send('Cannot Move the parcel layer');
                    });
        })
        unzipper.on('error', function (err) {
            return res.status(500).send('Cannot unzip the parcel layer. Corrupt file contents.');
        });
        unzipper.extract({ path: gisFolderPath });





        // shp("/assets/gis/gis.zip")
        //     .then(function (geojson) {
        //         geojson.forEach(geo => {
        //             storeData(geo, gisJsonPath, `error on parcel ${JSON.stringify(geo)}`);
        //         });
        //         return res.status(200).send('File uploaded!');
        //     })
        //     .catch(err => {
        //         console.error({ err })
        //     })

    });

    app.post('/upload/gis-upload2', function (req, res) {
        // console.log(req.files);
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).send('No files were uploaded.');
        }

        const gisZipPath = path.join(process.cwd(), '/public/assets/gis/gis.zip');
        const gisJsonPath = path.join(process.cwd(), '/public/assets/gis/gis.json');

        console.log(req.files.file);
        // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
        let layer = req.files.file;

        // Use the mv() method to place the file somewhere on your server
        // let moved;
        layer.mv(path.join(process.cwd(), '/public/assets/gis/gis.zip'), function (err) {
            if (err) {
                return res.status(500).send('Cannot Move the parcel layer Benis Alert :(');
            }
            // moved = true;
        });
        console.log('made it');
        console.log(gisZipPath);
        shp("/assets/gis/gis.zip")
            .then(function (geojson) {
                geojson.forEach(geo => {
                    storeData(geo, gisJsonPath, `error on parcel ${JSON.stringify(geo)}`);
                });
                return res.status(200).send('File uploaded!');
            })
            .catch(err => {
                console.error({ err })
            })

    });
    app.get('/api/map-data/', function (req, res) {

        fileExists(gisJsonPath).then(exists => {
            console.log(exists);
            if (!exists) {
                return res.status(404).end();
            }
            if (!req.query.comps) {
                return res.status(200).send('No Comps to locate');
            }
            const adapter = new FileSync(gisJsonPath)
            const db = low(adapter)
            if (req.query.comps) {
                let compsSplit = req.query.comps.split(',');
                let compsArray = [];
                
                compsSplit.forEach(comp => {
                    compsArray.push({ id: comp })
                })
                console.log('comps',compsSplit,compsArray)
                let coords = db.get('features')
                    .find(compsArray)
                    .value()
                return res.status(200).json(coords);
            }
        });

        // return res.status(200).send('No Comps to locate');

    })
}