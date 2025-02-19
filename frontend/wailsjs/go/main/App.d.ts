// Cynhyrchwyd y ffeil hon yn awtomatig. PEIDIWCH Â MODIWL
// This file is automatically generated. DO NOT EDIT
import {clients} from '../models';
import {structs} from '../models';
import {dirsearch} from '../models';
import {space} from '../models';
import {isic} from '../models';
import {jsfind} from '../models';
import {info} from '../models';

export function AlibabaNacos(arg1:string,arg2:string,arg3:number,arg4:string,arg5:string,arg6:string,arg7:string,arg8:clients.Proxy):Promise<string>;

export function Callgologger(arg1:string,arg2:string):Promise<void>;

export function CheckCdn(arg1:string):Promise<string>;

export function CheckTarget(arg1:string,arg2:clients.Proxy):Promise<structs.Status>;

export function CyberChefLocalServer():Promise<void>;

export function DirScan(arg1:dirsearch.Options):Promise<void>;

export function DownloadCyberChef(arg1:string):Promise<void>;

export function ExtractIP(arg1:string):Promise<string>;

export function FaviconMd5(arg1:string):Promise<string>;

export function FingerprintList():Promise<Array<string>>;

export function FofaSearch(arg1:string,arg2:string,arg3:string,arg4:string,arg5:string,arg6:string,arg7:boolean,arg8:boolean):Promise<space.FofaSearchResult>;

export function FofaTips(arg1:string):Promise<space.TipsResult>;

export function Fscan2Txt(arg1:string):Promise<string>;

export function GetFingerPocMap():Promise<{[key: string]: Array<string>}>;

export function GitDorks(arg1:string,arg2:string,arg3:string):Promise<isic.GithubResult>;

export function GoFetch(arg1:string,arg2:string,arg3:any,arg4:{[key: string]: string},arg5:number,arg6:clients.Proxy):Promise<structs.Response>;

export function HikvsionCamera(arg1:string,arg2:number,arg3:Array<string>,arg4:string,arg5:clients.Proxy):Promise<string>;

export function HostAlive(arg1:Array<string>,arg2:boolean):Promise<Array<string>>;

export function HunterSearch(arg1:string,arg2:string,arg3:string,arg4:string,arg5:string,arg6:string,arg7:boolean):Promise<structs.HunterResult>;

export function HunterTips(arg1:string):Promise<structs.HunterTips>;

export function ICPInfo(arg1:string):Promise<string>;

export function IPParse(arg1:Array<string>):Promise<Array<string>>;

export function IconHash(arg1:string):Promise<string>;

export function InitRule():Promise<boolean>;

export function InitTycHeader(arg1:string):Promise<void>;

export function Ip138IpHistory(arg1:string):Promise<string>;

export function Ip138Subdomain(arg1:string):Promise<string>;

export function IpLocation(arg1:string):Promise<string>;

export function IsRoot():Promise<boolean>;

export function JSFind(arg1:string,arg2:string):Promise<jsfind.FindSomething>;

export function LoadDirsearchDict(arg1:Array<string>,arg2:Array<string>):Promise<Array<string>>;

export function NewSynScanner(arg1:Array<string>,arg2:Array<string>,arg3:Array<number>):Promise<void>;

export function NewTcpScanner(arg1:Array<string>,arg2:Array<string>,arg3:Array<number>,arg4:number,arg5:number):Promise<void>;

export function NewWebScanner(arg1:Array<string>,arg2:clients.Proxy,arg3:number,arg4:boolean,arg5:boolean,arg6:boolean,arg7:Array<string>):Promise<void>;

export function PortBrute(arg1:string,arg2:Array<string>,arg3:Array<string>):Promise<void>;

export function PortParse(arg1:string):Promise<Array<number>>;

export function QuakeSearch(arg1:Array<string>,arg2:string,arg3:number,arg4:number,arg5:boolean,arg6:boolean,arg7:boolean,arg8:boolean,arg9:string,arg10:string):Promise<space.QuakeResult>;

export function QuakeTips(arg1:string):Promise<space.QuakeTipsResult>;

export function Sock5Connect(arg1:string,arg2:number,arg3:number,arg4:string,arg5:string):Promise<boolean>;

export function SpaceGetPort(arg1:string):Promise<Array<number>>;

export function StopDirScan():Promise<void>;

export function StopPortBrute():Promise<void>;

export function StopPortScan():Promise<void>;

export function StopSubdomain():Promise<void>;

export function StopWebscan():Promise<void>;

export function Subdomain(arg1:structs.SubdomainOption):Promise<void>;

export function SubsidiariesAndDomains(arg1:string,arg2:number,arg3:number,arg4:boolean,arg5:string):Promise<Array<info.CompanyInfo>>;

export function System(arg1:string,arg2:number):Promise<Array<any>>;

export function ThinkDict(arg1:string,arg2:string,arg3:string,arg4:string,arg5:string,arg6:string,arg7:string,arg8:Array<string>):Promise<Array<string>>;

export function TycCheckLogin():Promise<boolean>;

export function UncoverSearch(arg1:string,arg2:string,arg3:number,arg4:structs.SpaceOption):Promise<Array<space.Result>>;

export function WechatOfficial(arg1:string):Promise<Array<info.WechatReulst>>;
