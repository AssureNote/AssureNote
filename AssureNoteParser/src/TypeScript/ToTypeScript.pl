use strict;
use warnings;

open(DATAFILE, "< $ARGV[0]") or die("error :$!");

my $Keyword = "(?:ifdef|endif|return|new|throw|class|interface|extends|implements|public|private|protected|static|final|function|instanceof|else|var)";
my $Sym  = "(?:(?!$Keyword\\b)\\b(?!\\d)\\w+\\b)";
my $Type = "(?:$Sym(?:<.*?>)?(?:\\[\\s*\\d*\\s*\\])*)";
my $Attr = "(?:\\b(?:public|private|protected|static|final)\\b\\s*)";

my $src = join '', <DATAFILE>;

my @StringLiterals;
my @Comments;

sub ProtectString{
	my $n = @StringLiterals;
	my $text = $_[0];
	$StringLiterals[$n] = $text;
	return "#STR$n#"
}

sub ProtectComment{
	my $n = @Comments;
	my $text = $_[0];
	$Comments[$n] = $text;
	return "#COMMENT$n#"
}

sub fixup {
	# "\\n" => "\n"
	my $text = $_[0];
	if(length($text) == 2) {
		my @list = split(//, $text);
		if($list[0] eq "\\") {
			if($list[1] eq "t") {
				return "\t";
			}
			if($list[1] eq "n") {
				return "\n";
			}
			if($list[1] eq "\\") {
				return "\\";
			}
		}
	}
	return $text;
}

# Restricted Java Comments
$src =~ s/\/\*constructor\*\//#Constructor#/g;
$src =~ s/\/\*local\*\//#Local#/g;
$src =~ s/\/\*field\*\//#Field#/g;
$src =~ s/\/\*cast\*\//#Cast#/g;
$src =~ s/\/\*enum\(($Type)\)\*\//#enum($1)#/g;
$src =~ s/\/\*BeginArray\*\//#BeginArray#/g;
$src =~ s/\/\*EndArray\*\//#EndArray#/g;

# Char Literals
$src =~ s/'(\\.)'/ord(fixup($1))/eg;
$src =~ s/'(.)'/ord($1)/eg;
$src =~ s/('..')/($1.charCodeAt(0))/g;
$src =~ s/charAt\s*\(/charCodeAt(/g;

# Protect Comments
$src =~ s/(\/\*.*?\*\/)/&ProtectComment($1)/gmse;

# Protect String literals
$src =~ s/("(?:[^\\"]|\\.)*?")/&ProtectString($1)/ge;

$src =~ s/};/}/g;

sub Params{
	my $text = $_[0];
	$text =~ s/($Type)\s+($Sym)/$2: $1/g;
	return $text;
}

sub UnQuote {
	my $text = $_[0];
}

# Comments
$src =~ s/^\/\/[#\s]*ifdef\s+JAVA.*?VAJA//gms;
$src =~ s/(\/\/.*?)$/&ProtectComment($1)/gems;
# Remove assertion
$src =~ s/\s*assert.*?//gm;
# Foreach. for(int i : list) => for (int i #IN# list)
$src =~ s/for\s*\((.*?)\s*:\s*(.*?)\)/for ($1 #IN# $2)/g;
# Remove a type annotation in variable declarations for for/in expression
$src =~ s/#Local#($Type)\s+($Sym)\s+#IN#/var $2 #IN#/g;
# Fields. public static int n = 0; => public static n: int = 0;
$src =~ s/#Field#($Attr*)($Type)\s+($Sym)/$1$3: $2/gm;
# Local variables.  int n = 0; => var n: int = 0;
$src =~ s/#Local#($Type)\s+($Sym)/var $2: $1/g;
# Constractors.
$src =~ s/($Attr*)($Sym)#Constructor#\((.*?)\)/constructor(#params#$3)/g;
$src =~ s/new\s+($Type)\[(.+)\]/new Array<$1>($2)/g;
# Casts
$src =~ s/\(#Cast#($Type)\)/<$1>/g;
# enum
$src =~ s/#enum\((.*?)\)#/$1./g;
# Array literals.
$src =~ s/#BeginArray#{/\[/g;
$src =~ s/#EndArray#}/\]/g;

# Methods. public int f(float n){...} => public f(#params#float n): int{...}
$src =~ s/($Attr*)($Type)\s+($Sym)\s*\((.*?)\)/$1$3(#params#$4): $2/g;
# Exceptions. } catch (Exception e) { => } catch (e) {
$src =~ s/catch\s*\(\s*($Type)\s+($Sym)\s*\)/catch($2)/g;
# Method's parameters.
$src =~ s/\(#params#(.*?)\)/"(" . Params($1) . ")"/eg;
# Constants. public final static int N = 0; => var N: int = 0;
$src =~ s/(?:$Attr*) ($Type)\s+($Sym)((?:\[\s*\d*\s*\])?)/$2: $1$3/g;
# Array literals.
$src =~ s/=\s*{(.*?)}/= \[$1\]/g;

# Types
$src =~ s/(?!")\b(?:char|int|long|float|double|Charactor)\b(?!")/number/g;
$src =~ s/(?!")\b(?:Charactor|Integer|Long|Float|Double)\b(?!")/Number/g;
$src =~ s/\.(?:int|long|float|double|)Value\(\)//g;
$src =~ s/(?!")\bString\b/string/g;
$src =~ s/\bArrayList<\?>/any/g;
$src =~ s/\bArrayList\b/Array/g;
$src =~ s/\bnew\s+Array<.*?>\s*\(Arrays.asList\((.*?)\)\)/$1/g;
$src =~ s/\bArrays.asList\b//g;
$src =~ s/\.toArray\(\)//g;
$src =~ s/\b(\d+)L\b/$1/g;
$src =~ s/byte\[\]/string/g;

$src =~ s/\bfinal\b//g;
$src =~ s/\bprotected\b//g;
$src =~ s/\@Override\s*//g;
$src =~ s/\@Deprecated\s*//g;
$src =~ s/\bpublic interface\s*/interface /g;
$src =~ s/\binstanceof\s+string\b/instanceof String/g;
$src =~ s/\binstanceof\s+number\b/instanceof Number/g;
$src =~ s/\b([a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*) instanceof String/(typeof $1 == 'string' || $1 instanceof String)/g;

$src =~ s/[Nn]umber\.class/Number/g;
$src =~ s/[Ss]tring\.class/String/g;
$src =~ s/[Bb]oolean\.class/Boolean/g;
$src =~ s/[Oo]bject\.class/Object/g;
$src =~ s/[Vv]oid\.class/null/g;
$src =~ s/\.class//g;
$src =~ s/Class<\?>/any/g;

$src =~ s/\bnew Object(\(\))?/<any>{}/g;

$src =~ s/\blength\(\)/length/g;
$src =~ s/\bSystem\.out\.println/console.log/g;
$src =~ s/\bSystem\.err\.println/console.log/g;

$src =~ s/\binterface\b/declare class/g;

$src =~ s/\benum\b/export enum/g;
$src =~ s/\bclass\b/export class/g;
$src =~ s/\bpublic\s*export\s*class\b/export class/g;

# Delegates.
#$src =~ s/(?!\.)\b(Parse|Type)(?:Unary|Binary|Const|Block)\b(?!\()/LibLoadFunc.Load$1Func(Context, this, "$2")/g;
$src =~ s/\bGtDelegate(?:Common|Token|Match|Type)\b/any/g;

$src =~ s/#Constructor#//g;
$src =~ s/#Local#//g;
$src =~ s/#Field#//g;
$src =~ s/#Cast#//g;
$src =~ s/#BeginArray#//g;
$src =~ s/#EndArray#//g;
$src =~ s/#IN#/in/g;

my $n = @Comments;
my $i = 0;
while($i < $n){
	$src =~ s/#COMMENT$i#/$Comments[$i]/;
	$i = $i + 1;
}


$n = @StringLiterals;
$i = 0;
while($i < $n){
	$src =~ s/#STR$i#/$StringLiterals[$i]/;
	$i = $i + 1;
}

my $filename = $ARGV[0];
$filename =~ s@[/|\\]([^/]+)\..*@$1@;

print $src;
