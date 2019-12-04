const db = require("../models");
// const jwt = require('jsonwebtoken');
// const authentication = require('../middleware/authentication');
const fs = require('fs');
require('dotenv').config();
const path = require('path');
// var shapefile = require("shapefile");
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fileExists = require('file-exists');
const shp = require('shpjs');

const storeData = (data, path) => {
    try {
        fs.writeFileSync(path, JSON.stringify(data))
    } catch (err) {
        console.error(err)
    }
}

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
                console.log(parcels);
                res.json(parcels);
            })
            .catch(err => {
                res.json({ err })
            })
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
    app.post('/upload/gis-upload', function (req, res) {
        // console.log(req.files);
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).send('No files were uploaded.');
        }

        // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
        let layer = req.files.file;

        const gisZipPath = path.join(process.cwd(), '/public/assets/gis/gis.zip');
        const gisJsonPath = path.join(process.cwd(), '/public/assets/gis/gis.json');

        // Use the mv() method to place the file somewhere on your server

        shapefile.openShp(path.join(process.cwd(), "/public/assets/gis/gis.shp"))
            .then(source => source.read()
                // .then(function log(result) {
                //     if (result.done) return;
                //     console.log(result.value);
                //     return source.read().then(log);
                // }))
                .then(function store(result) {
                    if (result.done) return;
                    storeData(result.value, path.join(process.cwd(), "/public/assets/gis/gis.json"))
                    return source.read().then(store);
                }))
            .catch(error => console.error(error.stack));

        layer.mv(path.join(process.cwd(), '/public/assets/gis/gis.zip'), function (err) {
            if (err)
                return res.status(500).send(err);

            res.send('File uploaded!');
        });
    });
    app.get('/api/map-data/', function (req, res) {
        fileExists(path.join(process.cwd(), 'public', 'assets/gis/gis.zip')).then(exists => {
            if (!exists) {
                return res.status(404).end();
            }
            let comps = req.query.comps.split(',')



        });
        return res.send('Benis')
    })
}
