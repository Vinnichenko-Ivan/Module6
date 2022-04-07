//https://proglib.io/p/pishem-neyroset-na-python-s-nulya-2020-10-07
let a = 1.6733
let b = 1.0507
function sigmoid(x){
    //return 1 / (1 + Math.exp(-x));
    if(x > 0){
        return b * x;
    }
    return a*b*(Math.exp(x) - 1);

    return Math.max(0, x);
}


function derivSigmoid(x){
    if(x < 0){
        return a * b * Math.exp(x);
    }
    return b;


    if(x < 0){
        return 0;
    }
    return 1;
    // let fx = sigmoid(x);
    // return fx * (1 - fx);
}

function randParam(){
    return Math.random();
}

function randParams(size){
    let answer = []
    for(let i = 0; i < size; i++){
        answer.push(randParam());
    }
    return answer;
}

class Neuron{
    t1 = 0
    output = 0;
    error = 0;
    weights = [];
    weightsCount = 0;
    input = [];

    b = 0;

    total = 0
    setWeights(weightsCount, weights, b){
        this.weightsCount = weightsCount;
        for(let i = 0; i < weightsCount; i++){
            this.weights.push(weights[i]);
            this.input.push(0);
        }

        //this.b = b;
    }

    result(input){
        //this.input = input;
        let total = 0;
        for(let i = 0; i < this.weightsCount; i++)
        {
            this.input[i] = input[i].output;
            total += this.weights[i] * input[i].output;
        }
        //total += this.b;
        this.total = total
        this.output = sigmoid(total)
        //return sigmoid(total);
    }

}

class SaveOBJ{
    invisibleLayers = []
    outputLayer = []
}

class NeuronFullNet{
    learningRate = 0.1

    inputLayersSize = 0
    inputLayers = []

    invisibleLayersCount = 0;
    invisibleLayersSize = []
    invisibleLayers = [[]]

    outputLayerSize = 0
    outputLayer = []

    setSizes(inputLayersSize, invisibleLayersCount, invisibleLayersSize, outputLayerSize){
        this.inputLayersSize = inputLayersSize;
        this.invisibleLayersCount = invisibleLayersCount;
        this.invisibleLayersSize = invisibleLayersSize;
        this.outputLayerSize = outputLayerSize;
    }

    genNeurons(){
        this.inputLayers = [];
        this.invisibleLayers = []
        this.outputLayer = []
        for(let i = 0; i < this.inputLayersSize; i++){
            this.inputLayers.push(new Neuron());
        }
        for(let i = 0; i < this.invisibleLayersCount; i++){
            this.invisibleLayers.push([]);
            for(let j = 0; j < this.invisibleLayersSize[i]; j++){
                this.invisibleLayers[i].push(new Neuron());
            }
        }
        for(let i = 0; i < this.outputLayerSize; i++){
            this.outputLayer.push(new Neuron());
        }
    }

    genRandParam(){
        for(let i = 0; i < this.invisibleLayersCount; i++){
            for(let j = 0; j < this.invisibleLayersSize[i]; j++){
                if(i === 0) {
                    this.invisibleLayers[i][j].setWeights(this.inputLayersSize, randParams(this.inputLayersSize), randParam());
                }
                else{
                    this.invisibleLayers[i][j].setWeights(this.invisibleLayersSize[i - 1], randParams(this.invisibleLayersSize[i - 1]), randParam());
                }
            }
        }
        for(let i = 0; i < this.outputLayerSize; i++){
            this.outputLayer[i].setWeights(this.invisibleLayersSize[this.invisibleLayersCount - 1], randParams(this.invisibleLayersSize[this.invisibleLayersCount - 1]), randParam());
        }
    }

    toSaveObj(){
        let saveObj = new SaveOBJ;
        for(let i = 0; i < this.invisibleLayersCount; i++){
            saveObj.invisibleLayers.push([])
            for(let j = 0; j < this.invisibleLayersSize[i]; j++){

                saveObj.invisibleLayers[i].push(JSON.parse(JSON.stringify(this.invisibleLayers[i][j].weights)))
            }
        }
        for(let i = 0; i < this.outputLayerSize; i++){
            saveObj.outputLayer.push(JSON.parse(JSON.stringify(this.outputLayer[i].weights)))
        }
        return saveObj;
    }

    fromSaveObj(saveObj) {
        for(let i = 0; i < this.invisibleLayersCount; i++){
            for(let j = 0; j < this.invisibleLayersSize[i]; j++){
                if(i === 0) {
                    this.invisibleLayers[i][j].setWeights(this.inputLayersSize, (JSON.parse(JSON.stringify(saveObj.invisibleLayers[i][j]))), randParam());
                }
                else{
                    this.invisibleLayers[i][j].setWeights(this.invisibleLayersSize[i - 1], (JSON.parse(JSON.stringify(saveObj.invisibleLayers[i][j]))), randParam());
                }
            }
        }
        for(let i = 0; i < this.outputLayerSize; i++){
            this.outputLayer[i].setWeights(this.invisibleLayersSize[this.invisibleLayersCount - 1], (JSON.parse(JSON.stringify(saveObj.outputLayer[i]))), randParam());
        }
    }

    setInput(input){
        for(let i = 0; i < this.inputLayersSize; i++){
            this.inputLayers[i].output = input[i];
        }
    }

    genOutput(){
        for(let i = 0; i < this.invisibleLayersCount; i++){
            for(let j = 0; j < this.invisibleLayersSize[i]; j++){
                if(i === 0) {
                    this.invisibleLayers[i][j].result(this.inputLayers);
                }
                else{
                    this.invisibleLayers[i][j].result(this.invisibleLayers[i - 1]);
                }
            }
        }
        for(let i = 0; i < this.outputLayerSize; i++){
            this.outputLayer[i].result(this.invisibleLayers[this.invisibleLayersCount - 1]);
        }
    }

    printOutput(){
        for(let i = 0; i < this.outputLayerSize; i++){
            console.log(this.outputLayer[i].output)
            console.log("\n")
        }
    }

    softMax(){
        let mass = []
        this.outputLayer.forEach(function (n){
            mass.push(n.output);
        })
        var maximum = mass.reduce(function(p,c) { return p>c ? p : c; });
        var nominators = mass.map(function(e) { return Math.exp(e - maximum); });
        var denominator = nominators.reduce(function (p, c) { return p + c; });
        var softmax = nominators.map(function(e) { return e / denominator; });

        var maxIndex = 0;
        softmax.reduce(function(p,c,i){if(p<c) {maxIndex=i; return c;} else return p;});
        var result = [];
        for (var i=0; i<mass.length; i++)
        {
            if (i==maxIndex)
                result.push(1);
            else
                result.push(0);
        }
        let a = result;
        this.outputLayer.forEach(function (n, index){
            n.output = softmax[index];
        })
        // let total = 0
        // let maxim = - 100000000000000
        // this.outputLayer.forEach(function (i) {
        //     maxim = Math.max(maxim,i.output)
        // })
        // this.outputLayer.forEach(function (i) {
        //     total += Math.exp(i.output - maxim );
        // })
        // this.outputLayer.forEach(function (i, index) {
        //     i.output = Math.exp(i.output - maxim ) / total + 0.000000001;
        // })
    }

    // softMax(){
    //     let total = 0
    //     let maxim = - 100000000000000
    //     this.outputLayer.forEach(function (i) {
    //         maxim = Math.max(maxim,i.output)
    //     })
    //     this.outputLayer.forEach(function (i) {
    //         total += Math.exp(i.output - maxim );
    //     })
    //     this.outputLayer.forEach(function (i, index) {
    //         i.output = Math.exp(i.output - maxim )/total;
    //     })
    // }

    crossEntropyForTen(answer){
        let p = [0,0,0,0,0,0,0,0,0,0]
        let q = [0,0,0,0,0,0,0,0,0,0]
        p[answer] = 1;
        for(let i = 0; i < 10; i++){
            q[i] = this.outputLayer[i].output;
        }
        let error = 0;
        for(let i = 0; i < 10; i++){
            error -= p[i] * Math.log(q[i]);
        }

        return error
    }

    countDError(answer){
        let p = [0,0,0,0,0,0,0,0,0,0]
        let q = [0,0,0,0,0,0,0,0,0,0]
        p[answer] = 1;
        for(let i = 0; i < 10; i++){
            q[i] = this.outputLayer[i].output;
        }
        for(let i = 0; i < 10; i++){
            q[i] -= p[i];
        }
        return q;
    }

    doubleError(answer, output){
        return (answer - output);
    }



    out(){
        let answer = 0;
        let answerIni = 0;
        for(let i = 0; i < 10; i++){
            if(this.outputLayer[i].output > answerIni){
                answerIni = this.outputLayer[i].output;
                answer = i;
            }
        }
        return answer;
    }

    setZeroErrors(){
        for(let i = 0; i < this.invisibleLayersCount; i++){
            for(let j = 0; j < this.invisibleLayersSize[i]; j++){
                this.invisibleLayers[i][j].error = 0;
            }
        }
        for(let i = 0; i < this.outputLayerSize; i++){
            this.outputLayer[i].error = 0;
        }
    }

    t1(n, l){
        return n.error * derivSigmoid(n.total);
    }

    newWeight(n, l){
        let t1 = n.error * derivSigmoid(n.total);
        let temp = n.weights[l] - t1 * this.learningRate * n.input[l];
        return temp;
    }

    teach(answer){
        this.setZeroErrors()
        this.softMax()
        let loss = this.crossEntropyForTen(answer)

        let dOutput = this.countDError(answer)

        for(let i = 0; i < 10; i++){
            this.outputLayer[i].error = dOutput[i];
        }



        for(let i = 0; i < 10; i++){
            for(let j = 0; j < this.invisibleLayersSize[this.invisibleLayersCount - 1]; j++){
                let newWeight = this.newWeight(this.outputLayer[i], j);
                this.invisibleLayers[this.invisibleLayersCount - 1][j].error += this.outputLayer[i].weights[j] * this.t1(this.outputLayer[i], j);
                this.outputLayer[i].weights[j] = newWeight;
            }
        }

        for(let i = this.invisibleLayersCount - 1; i > 0; i--){
            for(let j = 0; j < this.invisibleLayersSize[i]; j++){
                for(let l = 0; l < this.invisibleLayersSize[i - 1]; l++){
                    let newWeight = this.newWeight(this.invisibleLayers[i][j], l);
                    this.invisibleLayers[i - 1][l].error += this.invisibleLayers[i][j].weights[l] * this.t1(this.invisibleLayers[i][j], l)
                    this.invisibleLayers[i][j].weights[l] = newWeight;
                    //console.log(this.t1(this.invisibleLayers[i][j], l))
                }
            }
        }
        let answ = 0;
        let c = 0;
        for(let j = 0; j < this.invisibleLayersSize[0]; j++){
            for(let l = 0; l < this.inputLayersSize; l++){
                let newWeight =  this.newWeight(this.invisibleLayers[0][j], l);
                answ += newWeight - this.invisibleLayers[0][j].weights[l];
                c++;
                this.invisibleLayers[0][j].weights[l] = newWeight;

            }
        }
        console.log("^^^^^")
        console.log(answ / c);
        return loss;
    }
}


let inputLayersSize = 2500
let invisibleLayersCount = 1
let invisibleLayersSize = [10]
let outputLayerSize = 10

function matrixToLineMatrix(matrix){
    let lineMatrix = []
    for(let i = 0; i < matrix.length; i++){
        for(let j = 0; j < matrix[i].length; j++){
            lineMatrix.push(matrix[i][j]);
        }
    }
    return lineMatrix;
}


let neuroNet = new NeuronFullNet();
neuroNet.setSizes(inputLayersSize, invisibleLayersCount, invisibleLayersSize, outputLayerSize);
neuroNet.genNeurons()
neuroNet.genRandParam()
// let oldKF = "{\"invisibleLayers\":[[[0.42210204654567923,0.5397270914843966,0.8205693533122727,0.3692826259650579,0.7626075694045087,1.719461833385159,1.0847659559463565,1.1857647334716785,1.0638482421373905,0.9367501260939163,-0.19644788030537044,-0.39930326360945256,-0.958366284989341,-0.3681579345697872,0.4383118644840087,0.13085912101872688,-0.11354221773604278,-0.5728375159157562,0.3491545025215643,-0.09648615929558509,-0.4973875277341539,-0.1336054512208451,-0.8831553860946252,-0.2688964746244484,-0.13084145398203192],[1.4049749111283356,0.3691205668842274,0.7127773627325291,0.38790335489094474,0.2960690380906618,-1.5256374699500443,0.07223338466267457,-1.2525307875998277,0.18236210743871117,0.5592816442592228,0.05756975860437516,-1.2886739285110143,0.46155719545377766,0.5137793208959403,-1.0443650102123123,-0.6129858958421331,1.020075297555626,-0.02438877205901486,0.10374002221052295,0.17462379013381701,0.6621723125514881,-0.7135448188966466,0.24680272984933577,0.7151269188314273,1.0158781326089317],[-0.3261844983600552,0.5610395897769596,-0.3071999187425812,-0.2929345843139675,0.335276541814191,0.2189715008354156,-0.3931153631107819,-0.3958737489503415,-0.6209880458825912,-0.34334211061991265,-0.05207209205182367,0.44002612944304237,-0.13665184356333646,0.6174239220090031,0.05974001867333373,-0.31911545582274387,-0.4115608521543876,0.7040428835800044,0.09028792699804435,1.1320291032601781,0.626596070991019,1.1410649907141208,-0.12749279622328336,0.18039177817095756,-0.07209281743625201],[-0.3424012025591315,-0.5134349231824864,-0.07967047663441353,0.9461535928768814,0.34150145805539833,0.9115997943957691,1.015272977374808,0.4377403452724705,-0.21973812878301555,-0.9364016445073445,-0.6999184024491856,-0.23399479747006163,0.530998714593165,-0.1565741375933525,-0.7292443982981586,0.17718790925830064,0.16617168640850055,0.47068947914375714,-0.16140413360080869,0.30581902284438034,-0.0616068077357512,-0.27498951183738096,0.8052887739338618,0.1972773258860408,-0.1409003540551883],[-0.326951442599348,0.1880867456700139,-1.047579852065467,0.776117407232391,0.6045205112970111,0.5285382669570887,-0.2996349526366325,-0.017515907879394933,0.6998964995188741,0.8966948108968811,0.11679598160820642,0.0067306935508182324,-1.3059825404449141,0.4645783115045669,-0.44514522683326646,0.4925462839082396,0.5382007329132266,0.1612062506870822,0.1102070622336617,-0.11497190769520059,-0.38332813773695396,-0.16336445543551487,-1.351042099184964,0.013824217539988057,0.448782948267005],[0.4016725496114704,-0.4303458599926341,-0.5106336523452801,-0.5297897606141768,0.10155922236995286,0.16940917931035876,0.2548806244696361,-0.3764201661797658,0.5799290456883555,0.2045844190215007,0.30730083584873724,-0.8970080312877181,-0.14781217722509135,1.157565431337128,0.4330818024046561,-0.023959148655087817,-0.3814797392382883,-0.5963790151268695,0.28982857196339556,0.785318283914305,-0.17703234231130727,-0.13933250660712873,-0.5162181724350624,0.6273518733153758,0.5843968611095467],[-0.5018150195768363,-1.6572670472404576,-0.5148343235355236,-1.0307947824561974,-0.27935475850076824,0.9314759414559041,0.5973930085215359,1.3473160424113713,0.7977205281229397,1.4263444561539769,0.5271676362357897,-0.11456951712676681,0.9919096242462716,0.27651024363717,0.7608025770724075,0.030843886367214485,0.22710050884373428,0.532461832719861,0.19323700913919267,0.710310565882445,0.22885218181697173,0.23795470031857738,-0.5353757971846336,-0.7319818115678086,-0.4744832675260994],[-0.8545859081715623,-0.7267908170826869,-0.2943890966655301,-0.21958494652926477,-0.40060023402626993,0.01906039578939213,0.2748317888217995,-0.25109256843185146,0.24027874208949007,0.060660087111874074,-0.4884659045056225,-0.41807412387828563,-0.6495972254870976,-0.29079965017102644,0.14336801086577342,2.0045947438321643,2.0089740188545018,1.7688196998950871,0.7849244858621396,0.4440814947329055,0.12839383610743543,0.3286953000834548,0.2756042073784315,0.6653726447861456,0.6166609735308146],[0.6688452131672231,1.1448628362897508,0.08139101403072892,0.36310051604718874,0.03848109453700961,-1.2270968135932332,-1.2137762172871225,0.33845387496107154,0.87032803142617,2.3615250136514985,0.6846308440783536,-0.0524226916376699,0.28975158208596086,-0.51676259735194,0.19487092402587144,0.5291970018623989,0.1722236979295827,-0.4472852507848185,-0.9955550319053528,-1.3505957268187938,0.14759859382092197,0.9567646280243639,0.05374870219292872,0.5175360498772357,0.4980112989753208],[0.8292136917464115,0.964659869949079,0.26076838910991573,0.11572999505184058,0.6585902416737932,1.008854168142185,0.5582563411570497,-0.16775672032096825,0.2658585591322705,-0.9523605433479776,-0.08530336531634611,-0.17509295688724152,-0.5406777809503666,-0.11913271376123638,0.2063516710272676,-1.070951247403851,-0.26682732592666364,0.6545640240160517,0.02928233718284585,0.9574841603181652,0.26369141799608303,0.19854717591734986,-0.2938896791889623,-0.38022083339799795,0.3641508080144693],[0.6187497682256138,0.2698140083688975,0.011231010551078495,-0.2672406020939275,0.5484649807461981,0.27942330446152436,0.024381576167194656,0.3496591856398476,0.17117869567291003,0.4016756736606823,0.11219544333656137,0.4898100477101493,-0.11103685481603326,-0.20566541182075374,0.7174456834606159,1.3454783057084032,0.7072590993016683,-0.23083861501404646,0.26548606859968654,0.051544953270682196,0.39096694783682023,-0.5332993877369517,-0.07279104224872678,0.1896457167068517,-0.11502508245444061],[0.9344954510950494,0.48217839868224616,0.6216185480632362,-0.005776369038752077,0.3946092251104676,-0.43805193074475085,-0.3810843069337794,0.9924714874049346,0.8162954973843636,1.1190173182866827,-0.06877707831297625,-1.1277743409296792,0.05535729108185281,-1.1673946977411602,0.20145981106299035,0.2515912300582508,-0.4952297062784843,0.747891115210338,0.5357905973093012,0.38315679297282146,-0.011586015140573478,-0.5371554985207179,0.0085381231349436,-1.0708368111648001,-0.12989037696902395],[-0.12943321912244438,0.04533873967153035,0.154186179359537,-0.014264501531220365,0.490097977599164,1.6232481417090792,0.5930359154749201,-0.5483974887896375,-0.26806914025646955,-0.7107521542004198,0.1875013458044065,0.4449755743786378,0.194951003753863,-0.2146245972955113,0.30045882463593754,1.321085253310746,0.4608708328186196,0.057445153164071235,-0.5196364953501507,-0.4463648737272328,0.203535783455738,-0.05284684157288845,0.047446110693003835,0.706913319190118,0.8673597174049764],[0.025679212236820508,-0.10245007005080822,-0.013704634516863427,0.5255108862210627,-0.09699664575603822,0.5524022975019749,0.1896829583475587,0.30382995522097006,-0.4706808842368836,-0.4016486442069097,0.22498135063056846,0.003244164447151206,-0.28637251493867394,-0.10389165679869623,0.48859354180831227,-1.1314822372811983,-0.8181831760968408,-0.6611414344225784,0.6022682449700776,1.6287969756889153,1.3953289354514162,1.2828117646182302,0.7516051088687421,0.27884072612842153,-0.14343087494236187],[0.6449656701852813,-0.5993066132637794,0.2988349780514375,-1.1085252351489279,0.6571396703735263,-0.14634648352359797,0.5343492953514065,0.049089638686144924,0.4540224003587776,0.4796172038815216,-0.01606004251795114,-0.3133740910818347,0.10008059803908985,-0.47234280982118104,-0.07084297082497511,1.1616502878502228,0.08504846731160501,-0.49234525172993043,-0.11136231743993817,0.311122011516654,0.6311350742649626,-0.31604880730556223,-0.20478896887745587,-0.6141340072983014,0.5818680614979618],[0.20432558480187102,0.3126346705926585,0.027512996150353315,0.04770697851629129,-0.2297008078718386,-0.8029390213502288,-0.017001205790775967,-0.0764515548502325,0.8691667675201127,0.23150602300871806,0.462287518508011,0.03562140391491234,-0.18519540101594165,0.295923208592779,0.23113593840869562,-1.1090090434853241,-0.3957989207929802,0.017383693821711354,0.08505293514452417,0.3100846866033606,1.0403895633691411,1.3557769576019238,0.5543531812090522,-0.1722448788943356,0.2712225322507744],[-0.09300616004576127,-0.40124645926808195,-1.9675967019072544,-0.051258244045734536,0.14881868883834606,0.6255688747079002,-0.40982892081099387,-0.8674458368073623,0.7998733020322,1.0100975948190625,1.0874113569104626,0.4454294628336092,-1.1428338017761341,0.32476368561415353,0.5697099059887014,1.2112996611878593,1.391255595838328,-1.0215761440038327,0.6851521414423908,0.11668747539153858,0.5734512584186902,0.020259471426836602,0.41180210617371976,0.5131626903909776,0.4686098131303703],[0.17140716431794106,-0.06190801226886387,0.7166839369333631,1.125954184414075,0.8279619507955783,0.36266917094809675,-0.19455098356638062,-0.5685115378810652,-0.6030721249563045,-0.9548901019989438,0.32215978106013593,0.15623967006872594,0.022547743823080422,0.2460184117069081,0.2956336974988786,1.211194784749002,0.20256043836069876,0.4351182993539594,0.4940723398476555,0.28402550954938593,0.19866526668290044,0.10373780268882647,-0.811161689133334,-0.2612132578172535,0.07743114146746045],[0.7407698135094166,0.6565477404022183,-0.5695342605841295,-0.7139588372460572,0.6490665540611507,-0.1581272028214806,0.5120221498789048,-0.2820292868088771,-1.1015580552922153,0.9209276124356827,0.18451531065131124,0.9690598130766557,-1.2707996935466435,0.014786126660672128,0.5541777561905898,0.9771185228214607,0.7323033815073402,-0.28003933419152466,-0.4581617355956589,0.44488263395272515,0.9192871407544297,0.5908796708986573,-1.4760338730764724,-0.46041496735294773,-0.20734034466308104],[0.6765270327100767,0.470453593806401,0.7274206815419226,0.2917634413705168,0.5168574903132296,0.5037633384582744,0.24417924958494341,-0.11966128355225363,0.2716013721984208,-0.109025018876189,0.8239875290889193,-0.5506728032345001,-0.34594684797182923,-0.42780828829482775,0.3211701356610666,0.18930272767697343,0.6769542289401121,0.6390926835006592,0.4979393746856122,1.1952936061405266,-0.5477688095601215,-0.7987332290221884,-0.5013302972119804,-0.6413950347512938,-0.3634769899913318],[0.07809631519820602,-0.626512687773837,-0.7620674979819484,-0.4924041143145458,-0.021901159040221566,0.5083204492201042,0.9444016586646492,0.7957756115282386,1.2990072168579458,0.8484402975475975,-0.007594867029297154,0.8566469794471165,0.23368474978746218,0.28675640200374775,0.5034183474270495,1.2358781129102006,0.7297062551656315,0.38936456920831236,0.8242637084810889,0.6648379382393151,0.22298113863394706,-0.36765513883882983,-0.45707537228364625,-0.33475808761907727,0.18357796476126031],[0.2173772613086723,-0.48793449211540707,0.4560175009904044,0.17219113023635274,0.2756200355733388,-1.2684131639145078,-0.18733141351446192,-0.7718079133847059,-0.22044112752024947,-0.5631109451161855,-0.10017816326519453,0.7928416089472704,-1.5771932024095638,0.059191304037584005,-0.11029588252061151,0.14621131114226504,0.6134496239248285,1.2191800467540987,0.5053132615445681,0.13659725776159862,0.7072932589594775,0.13324874777138257,0.585458117329126,0.2182214854195004,0.9107079525114259],[0.4656875954417468,-0.2708648183240483,-0.4568680508009606,-0.037682673650632596,0.794267831987217,1.0747750494876933,1.0190973122367237,0.11657778401070909,-0.1991475392742173,-0.29313963936658943,0.3150046738279896,0.4509200582698062,0.5262116076370691,0.5162229501930489,0.4667155168879956,-0.9482444281372767,-0.5394862147719446,-0.5994115986029506,0.18861148325539212,1.4265859059875319,0.5598469064915799,-0.1872680093269084,0.37266291034981636,0.0019802578160925313,-0.22567373761022125],[0.12793010007809028,0.8014732331552452,-0.34404200922397665,0.3497441386483434,0.22171178094453456,0.6954732012929652,1.0929623346964525,-0.03394236080488847,1.5491810836215716,0.26727863631317084,-0.714556445580962,-0.03052581653254146,-0.778182430206914,-0.009272895756445713,0.36103161920995347,0.8544472537907198,0.35194504111056496,-1.0677737083179843,0.4632799618174935,0.46849302231384915,-0.7253873413837496,0.20663511371888957,-1.0367494976632734,-0.012058159917478523,-0.1900349290357249],[-0.38065699289269767,0.08417199571063133,-0.8316315882806914,0.34845110193866513,0.4398473468073071,0.16713225449711444,-0.3619612672423981,-0.6077776388287975,-0.5008707342403149,-0.5751691209682233,0.4628879581198461,-0.7551880517674432,0.024203088293540037,-0.7218319748842785,0.29950528804564586,0.5593840877573514,1.3709582963118823,0.9890637206052896,1.5340621862774306,1.110396648914678,-0.09414865535011657,0.6719011965096658,0.16581064081358352,0.36980218413283716,0.012848006456396055]]],\"outputLayer\":[[2.046855086418082,-1.0120391386727363,-0.10074745021354661,-0.6366559992338647,-0.8128538211484164,-1.1376527784011854,1.3708462266964172,2.1011300625507747,1.3025211287206473,0.6616071030652075,1.07729662323753,0.8702148819535589,0.4011956260685882,0.37341200863949187,-0.1919301732571457,-0.12824185121539874,1.430700007600051,0.1350708049704623,-1.5529925888809786,1.3401348279980487,1.1667330058630088,1.8205818796100475,-0.061064986608653705,0.3413782695066847,2.0995729577828466],[0.5933531427869962,-1.1520647468574505,0.10958755576153668,1.7341503226580557,1.4605504555326352,0.9679424283093578,2.0599660148508367,0.8485186832519187,-0.8539224641221143,-0.4091229546523277,-0.4928095617481442,1.9689575827757613,0.5359057269608583,-0.5398652024707408,1.0752445533586457,0.005825673426608052,2.763724005746965,0.12453651153387352,1.8801628802300892,0.3077480619296981,0.9051514301933693,-0.3846939619681034,-0.39421519069222655,1.9090699628832941,0.9089227961827335],[-0.5043952827788576,1.5215049462967054,0.16093779312542705,0.37973868593181515,0.9183784369759241,0.2902094242032455,-0.10841706961953848,0.7408665094058404,2.9631308733647024,-1.0974352505619165,1.1088664974292148,-0.09128506803824364,1.1706516253005879,-0.5981826035068668,0.9637562852913236,0.734124643251812,1.2363450843458403,0.4585268837787177,0.969887853931058,-0.9919064073081341,0.3573741353560852,0.9952898153128872,-0.5190607863162309,-0.2041576766712667,-0.2856934987893449],[-0.9485423086738857,2.3143761918705414,1.6840254815797364,-0.43909599708041747,0.7126161916452809,0.9895113623477115,0.30302728577122623,-0.563778650860549,1.3023077307138624,0.6519561766577135,-0.40202595677079134,0.6651588566278911,-1.1712140379141174,1.3713671092448132,0.9800702752775308,2.026472387511426,0.8411782157510168,-0.570781955300831,1.249799492646947,0.4267028975938284,0.15547197345075664,1.1232169365874645,0.369915580489831,-0.695471576159518,0.5121313914930173],[0.9476087293851034,0.19962789849460563,0.12684525368669,0.785451487651568,0.06484595583208719,1.091396542392244,1.8903655202714795,-1.2285834811864265,-0.5763634819800418,0.8269132487096207,0.44348986254426637,0.700641119075071,0.7684353637560499,-0.128096984409121,1.504342465613448,-0.08859521337631596,-0.3710938900761679,-0.38424628687179896,-0.04421986797866897,0.7920267834892118,1.9150511593198833,-0.9985506646554724,1.6617179781713975,1.8205290101028975,-0.4153842082288615],[0.01655132029632431,0.10385451287292133,1.172784048873195,1.3971736368224588,0.8197704558594261,0.680561570947391,-1.3247366659704165,-0.6753479836622015,-1.1196866440596605,1.8941636273699347,0.043615740208487214,-0.6433912862391046,1.1462897874539464,2.1757222986189855,0.06039678095987219,0.7014053476069818,0.8340244504147271,0.7559995749520491,0.7813593953380964,0.3556097023134644,-1.0187951642656352,0.638147539192583,1.5047645917171468,-0.08574920287690296,0.5445624107786119],[-0.5019640270691275,0.34708893061985424,1.2433997126815577,1.0150139729149772,0.1348923337030427,0.33421892936506886,-0.21078292370095397,1.5001471695326325,-0.6134141643572781,0.6312103904066577,0.6096578784658713,-0.4132508178473264,1.6772240146384203,0.339650698387244,0.3705938282712364,-0.5397422849961198,-0.6334647984131397,1.946550437729403,-0.02231391589015937,1.4138428009667539,0.4643731614408637,0.9681148495483807,0.9755693491274061,-0.3677158899292935,1.8313268034841732],[1.2036099188576885,1.627808037362437,-0.41692009338622465,0.3523020513049668,1.0754688564780444,-0.0009883926083688005,-0.6092691188151947,-0.40200369233700867,1.4573147780474154,1.1091168427494706,0.6277305031519168,2.0203790906883423,-0.26030790763525363,-0.7977302289544783,0.6954656677776941,0.2204556115115123,-0.31972098737096755,1.1234407805618931,1.5348094058172057,1.1329207978550249,-0.08067663375921967,1.1882197957329408,-0.49929119671689604,1.2346675919822352,0.02466993060360784],[0.5944910271632449,0.9323388682717713,0.9838593653568758,0.5279499773665894,0.9613640878108934,0.22309915447411355,1.0171137278132973,1.7447138351468234,0.7533616506315749,0.04818313151680635,1.159976058257188,0.3307759383937275,1.0681219375074018,0.5433101301987904,0.8616031591717229,0.07072669080836526,-1.0801312023726075,0.14607815688995354,0.01479114317029365,0.3926934079065294,1.757137527980774,-0.038917734067133974,0.2927152477222449,0.5214773630436447,0.5669842381852714],[1.2239342270076228,-0.11658369254419933,0.6053699836257673,0.4623051275940143,-0.5502170015874004,0.38827145352211234,1.3733480322270137,-0.6654790775388505,0.44755510824296535,0.679751922327863,0.285287602244163,0.07734560296577599,0.18284023627866994,1.9076169498490176,-0.1743556665699527,1.3227871920003984,0.09921359870113894,0.21517071388318113,0.14792786254819912,-0.23395912348709175,0.6908501917536094,-0.49305553133413654,1.562673244344781,0.8251113508198282,-0.6156796351027611]]}"
// neuroNet.fromSaveObj(JSON.parse(oldKF))


const iter = document.getElementById('iter');
const clearButton = document.getElementById('clear');
const canvasIn = document.getElementById('input');
const contextIn = canvasIn.getContext('2d');
const run = document.getElementById('run');
const canvas = document.getElementById('drawer');
const context = canvas.getContext('2d');
const addButton = document.getElementById('add');
const saveButton = document.getElementById('save');
const saveKButton = document.getElementById('saveK');
const answerInput = document.getElementById('answerInput');
const answer = document.getElementById('answer');
const getButton = document.getElementById('get');
const form = document.getElementById('getter');

let weightCanvas = canvas.width;
let heightCanvas = canvas.height;
let weightCount = 50
let heightCount = 50

let inputNoLine =  new Array(heightCount).fill(0).map( () => new Array(weightCount).fill(0))

function drawLine(x1, y1, x2, y2){
    context.strokeStyle = 'white'
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
    context.closePath();
}

class Test{
    input
    answer = 0
}

let tests = []


function loop() {
    requestAnimationFrame(loop);
    context.clearRect(0, 0, canvas.width, canvas.height)
    let dx = weightCanvas / weightCount;
    let dy = heightCanvas / heightCount;
    for(let i = 0; i < weightCount; i++){
        drawLine(dx * i, 0, dx * i, heightCanvas);
    }
    for(let j = 0; j < heightCount; j++){
        drawLine(0, j * dy, weightCanvas, j * dy);
    }
    for(let i = 0; i < weightCount; i++){
        for(let j = 0; j < heightCount; j++){
            let temp = inputNoLine[i][j] * 255;
            context.fillStyle = 'rgb(' + temp + "," + temp + "," + temp + ")";
            context.fillRect(dx * j,dy * i , dx, dy);

        }
    }
}

// canvas.addEventListener('mousedown', function (event) {
//     let x = event.x - this.offsetLeft;
//     let y = event.y - this.offsetTop;
//     let dx = weightCanvas / weightCount;
//     let dy = heightCanvas / heightCount;
//     if (event.buttons === 1){
//         for(let i = 0; i < heightCount; i++){
//             for(let j = 0; j < weightCount; j++){
//                 let sx = dx * i;
//                 let ex = dx * i + dx;
//                 let sy = dy * j;
//                 let ey = dy * j + dy;
//                 if(sx < x && ex > x && sy < y && ey > y) {
//                     if(inputNoLine[j][i] === 1){
//                         inputNoLine[j][i] = 0;
//                     }
//                     else{
//                         inputNoLine[j][i] = 1;
//                     }
//                 }
//             }
//         }
//     }
//
//     neuroNet.setInput(matrixToLineMatrix(inputNoLine))
//     neuroNet.genOutput()
//     let a = neuroNet.out();
//     answer.innerHTML = a;
//     console.log(a);
//
// });

canvas.onmousemove = function drawIfPressed (event) {
    let x = event.x - this.offsetLeft;
    let y = event.y - this.offsetTop;
    let dx = weightCanvas / weightCount;
    let dy = heightCanvas / heightCount;
    if (event.buttons === 1){
        for(let i = 0; i < heightCount; i++){
            for(let j = 0; j < weightCount; j++){
                let sx = dx * i;
                let ex = dx * i + dx;
                let sy = dy * j;
                let ey = dy * j + dy;

                if(sx < x && ex > x && sy < y && ey > y) {
                    inputNoLine[j][i] = Math.min(inputNoLine[j][i] + 0.2, 1);
                }
                if(Math.abs((sx + ex) / 2 - x) < 15 && Math.abs((sy + ey) / 2 - y) < 15){
                    inputNoLine[j][i] = Math.min(inputNoLine[j][i] + 0.2, 1);
                }
                if(Math.abs((sx + ex) / 2 - x) < 25 && Math.abs((sy + ey) / 2 - y) < 25){
                    inputNoLine[j][i] = Math.min(inputNoLine[j][i] + 0.2, 1);
                }
            }
        }
    }
    if (event.buttons === 4){
        for(let i = 0; i < heightCount; i++){
            for(let j = 0; j < weightCount; j++){
                let sx = dx * i;
                let ex = dx * i + dx;
                let sy = dy * j;
                let ey = dy * j + dy;

                if(sx < x && ex > x && sy < y && ey > y) {
                    inputNoLine[j][i] = Math.max(inputNoLine[j][i] - 0.2, 0);
                }
                if(Math.abs((sx + ex) / 2 - x) < 15 && Math.abs((sy + ey) / 2 - y) < 15){
                    inputNoLine[j][i] = Math.max(inputNoLine[j][i] - 0.2, 0);
                }
                if(Math.abs((sx + ex) / 2 - x) < 25 && Math.abs((sy + ey) / 2 - y) < 25){
                    inputNoLine[j][i] = Math.max(inputNoLine[j][i] - 0.2, 0);
                }
            }
        }
    }
    //
    // neuroNet.setInput(matrixToLineMatrix(inputNoLine))
    // neuroNet.genOutput()
    // let a = neuroNet.out();
    // answer.innerHTML = a;
    // console.log(a);

};

addButton.addEventListener('click', function() {
    let temp = new Test;
    temp.input =  JSON.parse(JSON.stringify(inputNoLine))
    temp.answer = answerInput.value;
    tests.push(temp)
});

clearButton.addEventListener('click', function() {
    inputNoLine =  new Array(heightCount).fill(0).map( () => new Array(weightCount).fill(0))
});

function download(content, fileName, contentType) {
    var a = document.createElement("a");
    var file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}

saveKButton.addEventListener('click', function() {
    download( JSON.stringify(neuroNet.toSaveObj()), 'json.txt', 'text/plain');
});

saveButton.addEventListener('click', function() {
    download( JSON.stringify(tests), 'json.txt', 'text/plain');
});

iter.addEventListener('click', function() {
    neuroNet.setInput(matrixToLineMatrix(inputNoLine))
    neuroNet.genOutput()
    let a = neuroNet.out();
    answer.innerHTML = a;
    console.log(a);
});

getButton.addEventListener('click', function() {

    var data = require(form.value);
    tests = JSON.parse(data)
});

let all = 0;
let good = 0;
run.addEventListener('click', function() {
    for(let e = 0; e < 1000; e++)
    {
        all ++;
        let i = Math.floor(Math.random() * tests.length);
        neuroNet.setInput(matrixToLineMatrix(tests[i].input))
        neuroNet.genOutput()
        //neuroNet.printOutput()
        let a = "";
        a += i;
        a += " ";
        a += neuroNet.out();
        //console.log(a)
        if(tests[i].answer === neuroNet.out()){
            good ++;
        }
        console.log("--------")
        console.log(good / all)
        console.log(neuroNet.teach(Number(tests[i].answer)))

    }
});


form.addEventListener("change", handleFiles, false);
function handleFiles() {
    const fileList = this.files;
    let reader = new FileReader();
    // reader.readAsDataURL(file);
    reader.onload = function(e) {
        console.log( e.target.result) ;
        tests = JSON.parse(e.target.result);
    };
    reader.readAsText(fileList[0]);
    console.log(reader.result)

    console.log(fileList[0][3])

}
requestAnimationFrame(loop);

