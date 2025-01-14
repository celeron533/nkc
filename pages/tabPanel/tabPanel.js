/**
 * panelJson 格式
 * {
 *  id: id
 *  name: 名称
 *  floor: 层数
 *  son: 下级json
 * }
 */

// var panelArr = flatten(panelJson);
var panelArr = flatten(JSON.parse($('#panelDatas').text()));

var panelProto = {
    config: {
        para: null, // panel所在的dom
        panelData: [], // 组成panel的数据
        shellId: "panelShell", // 外壳Id, 如无必要，无需另传
        wallId: "panelWall", // 内壁Id，如无必要，无需另传
        closeId: "panelClose", // 关闭按钮Id，如无必要，无需另传
        headerId: "panelHeader", // 头部Id，如无必要，无需另传
        headerDomId: "headerDom",
        bodyDomId: "bodyDom",
        footerDomId: "footerDom",
        panelSureButtonId: "panelSureButton",
        contentWallId: "panelContentWall", // content内壁Id，如无必要，无需另传
        headerText: "请选择专业",
        panelExist: false, // panel是否存在
        panelInit: false, // panel是否初始化
        tagsLast: {
            id: "",
            name: ""
        }, // 选中的tags
        contentLast: {
            id: "",
            name: ""
        }, // 选中的content
        editStatus: "", // 是否处于专业修改状态 ing
        editTag: "", // 当前要修改的专业
        totalTags: [], // 当前专业名称与id
    },
    // 初始化panel
    init: function(obj) {
        // 初始化panel配置
        if(obj) {
            for(var i in obj) {
                panelProto.config[i] = obj[i];
            }
        }
        // 初始化panelDom
        // 获取input的上级div元素
        if(!panelProto.config.para) {
            return screenTopWarning("未指定dom")
        }
        var parentDivDom = $(panelProto.config.para).parent("div");
        $(parentDivDom).css("position", "relative");
        // 判断panel是否已经被创建
        if(!panelProto.config.panelExist) {
            // 创建panel
            panelProto.createShell(parentDivDom);
            // 获取被点击input的rect数据
            var paraRect = panelProto.config.para.getBoundingClientRect();
            // 获取外壳dom
            var panelShell = panelProto.get(panelProto.config.shellId);
            // 修改被点击input的css数据
            panelShell.style.width = paraRect.width + "px";
            panelProto.createTags(panelProto.config.panelData);
            panelProto.createSureButton();
        }
        panelProto.config.panelInit = true;
    },
    show: function() {
        var panelShell = panelProto.get(panelProto.config.shellId);
        panelShell.style.display = "block";
    },
    close: function() {
        var panelShell = panelProto.get(panelProto.config.shellId);
        panelShell.style.display = "none";
    },
    // 获取dom元素
    get: function(obj) {
        return document.getElementById(obj);
    },
    createShell: function(parentDivDom) {
        // 创建外壳
        var panelShell = document.createElement("div");
        panelShell.setAttribute('id', panelProto.config.shellId);
        panelShell.style.display = "none"; // 外壳创建时隐藏，使用show才可以出现
        panelShell.style.position = "absolute"; // 设置外壳为绝对位置
        panelShell.style.background = 'transparent'; // 设置外壳的背景色 
        panelShell.style.zIndex = '20000'; // 设置外壳的z-index
        // 将外壳放入body中
        // $("body").append(panelShell)
        $(parentDivDom).append(panelShell)
        // 将panel状态置为存在
        panelProto.config.panelExist = true;

        // 创建内壁
        var panelWall = document.createElement("div");
        panelWall.setAttribute("id", panelProto.config.wallId)
        panelWall.className = "panelWall";
        // panelWall.style.height = "200px"
        // 将内壁放入外壳中
        panelShell.appendChild(panelWall);

        var isPc = IsPC();
        if(!isPc) {
            $("#panelShell").css("left", "0");
            $("#panelWall").css("width", document.body.scrollWidth)
        }


        // 创建头部
        var headerDom = document.createElement("div");
        headerDom.setAttribute("id", "headerDom");
        // 创建一个关闭按钮
        var panelClose = document.createElement("span");
        panelClose.innerHTML = "x";
        panelClose.setAttribute('id', panelProto.config.closeId)
        panelClose.className = "panelClose";
        headerDom.appendChild(panelClose);
        // 创建一个header
        var panelHeader = document.createElement("div");
        panelHeader.innerHTML = panelProto.config.headerText;
        panelHeader.setAttribute("id", panelProto.config.headerId);
        panelHeader.className = "panelHeader";
        headerDom.appendChild(panelHeader);
        panelWall.appendChild(headerDom);        
        
        // 创建主体部分
        var bodyDom = document.createElement("div");
        bodyDom.setAttribute("id", "bodyDom");
        panelWall.appendChild(bodyDom);

        // 创建底部
        var footerDom = document.createElement("div");
        footerDom.setAttribute("id", "footerDom");
        panelWall.appendChild(footerDom)
    },
    // 创建tags组
    createTags: function(tagArr) {
        if(!tagArr) {
            return screenTopWarning("未传入tags数组")
        }
        // 创建一个ul为空的Dom元素
        var panelTag = document.createElement("ul");
        panelTag.className = "tagUl";
        // 将全部标签遍历到panelTag中
        var liDom = ""
        var floor;
        for(var ta = 0; ta < tagArr.length;ta++) {
            var aDom = "<a class='tagLiLink' data-id='" + tagArr[ta].id + "' data-index='" + ta + "' data-name='" + tagArr[ta].name + "' data-floor='" + tagArr[ta].floor + "' onclick='clickTags(this)'>" + tagArr[ta].name + "</a>";
            liDom += "<li class='tagLi'>" + aDom + "</li>";
            floor = tagArr[ta].floor;
        }
        panelTag.innerHTML = liDom;
        panelTag.setAttribute("data-floor", floor);
        // 将新建的tags组放入body中
        var bodyDom = panelProto.get(panelProto.config.bodyDomId)
        bodyDom.appendChild(panelTag);
    },
    // 消除指定tags组

    // 删除tags组后的所有同级元素
    clearTagsAfter: function(para) {
        // 获取data-floor为floor的ul元素
        // var tagsDom = $("ul[data-floor='"+floor+"']");
        para.nextAll().remove();
    },
    // 创建tabContent 放入body中
    createPanelContent: function(conArr) {
        var panelContentShell = document.createElement("div"); // content外壳
        var panelContentWall = document.createElement("div"); // content内壁
        panelContentWall.className = "panelContentWall";
        panelContentWall.setAttribute("id", panelProto.config.contentWallId);
        var panelContentUl = document.createElement("ul"); // content Ul
        panelContentUl.className = "panelContentUl";
        
        if(!conArr || conArr.length == 0) {
            conArr.push({name: "未分类"})
        }

        // 将全部标签遍历到panelContentUl中
        var liDom = "";
        for(var co = 0;co < conArr.length;co++) {
            var aDom = "<a class='panelContentLiLink' data-id='" + conArr[co].id + "' data-index='" + co + "' data-name='" + conArr[co].name + "' data-floor='" + conArr[co].floor + "' onclick='clickContent(this)'>"+conArr[co].name+"</a>";
            liDom += "<li class='panelContentLi'>"+aDom+"</li>"
        }
        panelContentUl.innerHTML = liDom;
        panelContentWall.appendChild(panelContentUl);
        var bodyDom = panelProto.get(panelProto.config.bodyDomId);
        bodyDom.appendChild(panelContentWall)
    },
    // 创建确定按钮
    createSureButton: function() {
        var panelButtonWall = document.createElement("div");
        panelButtonWall.className = "panelButtonWall";

        var panelSureButton = document.createElement("button");
        panelSureButton.setAttribute("id", panelProto.config.panelSureButtonId)
        panelSureButton.className = "panelSureButton editorBtn btn btn-primary btn-sm";
        panelSureButton.innerHTML = "确定";
        panelSureButton.disabled = true;
        panelSureButton.addEventListener("click", function() {
            panelProto.outputContentLast();
        })
        panelButtonWall.appendChild(panelSureButton);
        var footerDom = panelProto.get(panelProto.config.footerDomId);
        footerDom.appendChild(panelButtonWall)
        panelWall.appendChild(footerDom)
    },
    // 消除tabContent
    clearPanelContent: function() {
        $("#panelContentWall").remove();
    },
    // 点击tags
    clickTags: function(para) {
        panelProto.tagsActive(para)
        var dataId = para.getAttribute("data-id");
        var dataName = para.getAttribute("data-name");
        panelProto.config.contentLast.id = "";
        panelProto.config.contentLast.name = "不分类";
        // 将当前tags选中放入最终tags选中
        panelProto.config.tagsLast.id = dataId;
        panelProto.config.tagsLast.name = dataName;
        // 清除当前tags后的所有标签组
        panelProto.clearTagsAfter($(para).parents("ul"));
        // 判断子JSON中的son长度是否为0
        // 如果子JSON中son不为空，则打开新的tags
        // 如果为空，则打开content
        var item = getItemByDataId(dataId);
        var son = item.son;
        var isOpenContent = false;
        var panelSureButton = panelProto.get(panelProto.config.panelSureButtonId);
        if(son.length == 0) {
            panelSureButton.disabled = false;
            panelSureButton.style.backgroundColor = "#2b90d9";
            // panelProto.outputTagsLast();
            return;
        }
        for(var i=0;i < son.length;i++) {
            if(!son[i].son) {
                panelProto.outputTagsLast();
                return;
            }
            if(son[i].son.length > 0) {
                isOpenContent = true;
            }
        }
        if(isOpenContent) {
            panelSureButton.disabled = true;
            panelSureButton.style.backgroundColor = "#9baec8";
            panelProto.createTags(son);
        }else{
            panelSureButton.disabled = false;
            panelSureButton.style.backgroundColor = "#2b90d9";
            panelProto.createPanelContent(son);
        }
    },
    // 点击content
    clickContent: function(para) {
        panelProto.contentActive(para);
        var dataId = para.getAttribute("data-id");
        var dataName = para.getAttribute("data-name");
        // 将当前content选中放入最终content选中
        panelProto.config.contentLast.id = dataId;
        panelProto.config.contentLast.name = dataName;
        // 点击即为选中，输出选中的id
        // panelProto.outputContentLast();
    },
    // 输出选中的tags
    outputTagsLast: function() {
        var obj = {id:panelProto.config.tagsLast.id,name:panelProto.config.tagsLast.name,fid:panelProto.config.tagsLast.id,cid:""};
        $("#tabPanel").tagsinput('add', obj)
        panelProto.config.totalTags.push(obj);        
        panelProto.close();
    },
    // 输出选中的content
    outputContentLast: function() {
        var obj = {id:panelProto.config.tagsLast.id+":"+panelProto.config.contentLast.id,name:panelProto.config.tagsLast.name+":"+panelProto.config.contentLast.name,fid:panelProto.config.tagsLast.id,cid:panelProto.config.contentLast.id};
        if(panelProto.config.editStatus == "ing") {
            for(var i in panelProto.config.totalTags) {
                if(panelProto.config.totalTags[i].name == panelProto.config.editTag) {
                    $("#tabPanel").tagsinput('remove', panelProto.config.totalTags[i].id)
                }
            }
        }
        $("#tabPanel").tagsinput('add', obj)
        panelProto.config.totalTags.push(obj);        
        $(".label-info-tagsinput").each(function() {
            $(this).unbind();
            $(this).on('click',function() {
                editTag($(this))
            })
        })
        panelProto.close();
    },
    // 给选中tags添加active
    tagsActive: function(para) {
        // 判断点击元素所在的同级元素是否有active
        var isActive = $(para).parents("ul").find(".tagLiLinkActive");
        // 如果存在，则删除同级元素的active，给点击元素添加active
        if(isActive.length > 0) {
            $(para).parents("ul").find(".tagLiLinkActive").each(function() {
                $(this).removeClass("tagLiLinkActive");
            })
            $(para).addClass("tagLiLinkActive");
        }
        // 如果不存在，则直接给同级元素添加active
        else{
            $(para).addClass("tagLiLinkActive")
        }
    },
    // 给选中content添加active
    contentActive: function(para) {
        // 判断点击元素所在的同级元素是否有active
        var isActive = $(para).parents("ul").find(".panelContentLiLinkActive");
        // 如果存在，则删除同级元素的active，给点击元素添加active
        if(isActive.length > 0) {
            $(para).parents("ul").find(".panelContentLiLinkActive").each(function() {
                $(this).removeClass("panelContentLiLinkActive");
            })
            $(para).addClass("panelContentLiLinkActive");
        }
        // 如果不存在，则直接给同级元素添加active
        else{
            $(para).addClass("panelContentLiLinkActive")
        }
    }
}


// 打开专业选择panel
function openPanel(para) {
    var obj = {
        para: para,
        panelData: JSON.parse($('#panelDatas').text())
    }
    // 判断是否已经初始化
    if(!panelProto.config.panelInit) {
        panelProto.init(obj)
    }
    panelProto.show();
    // 添加关闭panel
    var panelClose = panelProto.get(panelProto.config.closeId);
    panelClose.addEventListener("click", function() {
        panelProto.close();
    })
}

// 点击tags中的标签并获取下级json
function clickTags(para) {
    panelProto.clickTags(para);
}

// 点击content 输出选中的id和name
function clickContent(para) {
    panelProto.clickContent(para);
}

// 输出选中
function outChooseTags() {
    panelProto.outputContentLast();
}

/**
 * 在json中查找下一层数据
 * 原数组
 * 当前层数
 * 当前索引
 */
function findNextJson(index, floor, arr) {
    var j = 1; // 初始层数

    function findNext() {
        if(j > floor) {
            j = 0;
            return; 
        }
        if(f < index) {
            for(var i=0;i < arr.length;i++) {

            }
        }
    }

}

/**
 * 多维数组扁平化
 */
function flatten(arr) {
    var result = [];
    var newArr = arr;
    function nextArr(newArr) {
        for(var i=0;i<newArr.length;i++) {
            if(newArr[i].son.length > 0) {
                nextArr(newArr[i].son)
            }
            result.push(newArr[i])
        }
    }
    nextArr(newArr)
    return(result)
}

/**
 * 获取层级数组
 * @原数组
 * @层数
 */
function getFloorArr(arr, floor) {
    var result = [];
    for(var i=0;i < arr.length;i++) {
        if(arr[i].floor == floor) {
            result.push(arr[i])
        }
    }
    return result;
}


/**
 * 根据data-id获取数组中的元素
 */
function getItemByDataId(dataId) {
    var item;
    var arr = flatten(panelProto.config.panelData);
    for(var i=0;i < arr.length;i++) {
        if(arr[i].id == dataId) {
            item = arr[i]
        }
    }
    return item;
}



function IsPC() {
    var userAgentInfo = navigator.userAgent;
    var Agents = ["Android", "iPhone",
                "SymbianOS", "Windows Phone",
                "iPad", "iPod"];
    var flag = true;
    for (var v = 0; v < Agents.length; v++) {
        if (userAgentInfo.indexOf(Agents[v]) > 0) {
            flag = false;
            break;
        }
    }
    return flag;
}

function editTag(para) {
    panelProto.config.editStatus = "ing";
    panelProto.config.editTag = $(para).text();
}

// 获取从专业传过来的fid
var demoQuery = getSearchKV();
if(demoQuery && demoQuery.type == "forum" && demoQuery.id){
    for(var f=0;f<panelArr.length;f++) {
        if(panelArr[f].id == demoQuery.id) {
            var obj = {id:panelArr[f].id,name:panelArr[f].name,fid:panelArr[f].id,cid:""};
            $("#tabPanel").tagsinput('add', obj)
        }
    }
}

Object.assign(window, {
    panelArr,
    panelProto,
    openPanel,
    clickTags,
    clickContent,
    outChooseTags,
    findNextJson,
    flatten,
    getFloorArr,
    getItemByDataId,
    IsPC,
    editTag,
    demoQuery,
});